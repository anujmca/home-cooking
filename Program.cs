using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using AnshaishaBackend;
using AnshaishaBackend.Models;
using System.Text.Json;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add PostgreSQL DB Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AnshaishaDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add Permissive CORS to allow running from local file system or other dev ports
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("AllowAll");

// Serve static files (wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

// Automatic DB Initialization and Seeding on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AnshaishaDbContext>();
    
    // Ensure database exists
    db.Database.EnsureCreated();
    
    // Check if tables and columns are created; if not, force recreate the database schema
    try
    {
        _ = db.MenuConfigs.Any();
        _ = db.Customers.Select(c => c.Pin).FirstOrDefault();
    }
    catch (PostgresException ex) when (ex.SqlState == "42P01" || ex.SqlState == "42703") // relation or column does not exist
    {
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
        db.SeedDefaultData();
    }
    
    // Seed default data if database is brand new
    if (!db.MenuConfigs.Any())
    {
        db.SeedDefaultData();
    }
}

// --------------------------------------------------------------------------
// 1. API: Consolidated App State
// --------------------------------------------------------------------------
app.MapGet("/api/state", async (AnshaishaDbContext db) =>
{
    var config = await db.MenuConfigs.FirstOrDefaultAsync() ?? new MenuConfig();
    var items = await db.MenuItems.OrderBy(x => x.Id).ToListAsync();
    var allOrders = await db.Orders.ToListAsync();
    var paymentsList = await db.Payments.Where(p => !p.IsPaid).OrderBy(p => p.Id).ToListAsync();
    var expensesList = await db.Expenses.OrderBy(e => e.Id).ToListAsync();
    var customersList = await db.Customers.OrderByDescending(c => c.Spent).ToListAsync();
    var announcementsList = await db.Announcements.OrderBy(a => a.Id).Select(a => a.Message).ToListAsync();
    var leaveConfig = await db.LeaveConfigs.FirstOrDefaultAsync() ?? new LeaveConfig();

    // Split orders into today's active orders and history logs
    var todayOrders = allOrders.Where(o => o.IsToday).OrderByDescending(o => o.Id).ToList();
    var historyOrders = allOrders.Where(o => !o.IsToday).OrderByDescending(o => o.Id).ToList();

    // Calculate finances
    // Revenue = sum of Delivered active orders + sum of Delivered history orders + sum of resolved (paid) payments
    var revenue = allOrders.Where(o => o.Status == "Delivered").Sum(o => o.Price) 
                  + await db.Payments.Where(p => p.IsPaid).SumAsync(p => p.Amount);
    var totalExpenses = expensesList.Sum(e => e.Amount);
    var netProfit = revenue - totalExpenses;

    // Parse leave dates
    string[] leaveDates = [];
    try
    {
        leaveDates = JsonSerializer.Deserialize<string[]>(leaveConfig.DatesJson) ?? [];
    }
    catch { }

    return Results.Ok(new
    {
        kitchenClosedToday = config.KitchenClosedToday,
        customerOrderingDate = "today",
        customerSelectedFutureDate = "",
        dashboardOrdersExpanded = false,
        isCustomerLoggedIn = false,
        isAdminUnlocked = false,
        enteredPin = "",
        menu = new
        {
            session = config.Session,
            graphicTemplate = config.GraphicTemplate,
            mealDescription = config.MealDescription,
            mealPrice = config.MealPrice,
            addons = new
            {
                roti = config.AddonRoti,
                rice = config.AddonRice,
                sabji = config.AddonSabji
            },
            items = items
        },
        orders = todayOrders,
        orderHistory = historyOrders,
        payments = paymentsList,
        expenses = expensesList,
        stats = new
        {
            revenue = revenue,
            expenses = totalExpenses,
            profit = netProfit
        },
        cart = new List<object>(),
        customerProfile = new
        {
            name = "Amit Sharma",
            phone = "9876543210",
            avatar = "👩‍💼"
        },
        customerAddress = new
        {
            tower = "Alexander",
            floor = "22",
            flat = "8"
        },
        customersList = customersList,
        announcements = announcementsList,
        leave = new
        {
            declared = leaveConfig.Declared,
            dates = leaveDates,
            reason = leaveConfig.Reason
        }
    });
});

app.MapPost("/api/kitchen/toggle", async (KitchenToggleRequest req, AnshaishaDbContext db) =>
{
    var config = await db.MenuConfigs.FirstOrDefaultAsync();
    if (config == null)
    {
        config = new MenuConfig();
        db.MenuConfigs.Add(config);
    }

    config.KitchenClosedToday = req.IsClosed;
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Kitchen status updated.", isClosed = req.IsClosed });
});

// --------------------------------------------------------------------------
// 2. API: Reset / Seed Data
// --------------------------------------------------------------------------
app.MapPost("/api/reset", (AnshaishaDbContext db) =>
{
    db.SeedDefaultData();
    return Results.Ok(new { message = "Database reset successfully." });
});

// --------------------------------------------------------------------------
// 3. API: Publish Daily Menu Configuration
// --------------------------------------------------------------------------


app.MapPost("/api/menu/publish", async (PublishMenuRequest req, AnshaishaDbContext db) =>
{
    var config = await db.MenuConfigs.FirstOrDefaultAsync();
    if (config == null)
    {
        config = new MenuConfig();
        db.MenuConfigs.Add(config);
    }

    config.Session = req.Session;
    config.MealDescription = req.MealDescription;
    config.AddonRoti = req.AddonRoti;
    config.AddonRice = req.AddonRice;
    config.AddonSabji = req.AddonSabji;

    // Update Checked status on items
    var allItems = await db.MenuItems.ToListAsync();
    foreach (var item in allItems)
    {
        item.Checked = req.CheckedItemIds.Contains(item.Id);
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Menu published successfully." });
});

// --------------------------------------------------------------------------
// 4. API: Add Custom Dish Preset
// --------------------------------------------------------------------------


app.MapPost("/api/menu/items/custom", async (CustomDishRequest req, AnshaishaDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(req.Name) || req.Price <= 0)
    {
        return Results.BadRequest("Invalid item details.");
    }

    var nextId = 1;
    if (await db.MenuItems.AnyAsync())
    {
        nextId = await db.MenuItems.MaxAsync(x => x.Id) + 1;
    }

    var newItem = new MenuItem
    {
        Id = nextId,
        Name = $"{req.Name} (Custom)",
        Price = req.Price,
        Checked = true,
        IsMeal = false
    };

    db.MenuItems.Add(newItem);
    await db.SaveChangesAsync();
    return Results.Ok(newItem);
});

// --------------------------------------------------------------------------
// 5. API: Orders Operations
// --------------------------------------------------------------------------


app.MapPost("/api/orders", async (CreateOrderRequest req, AnshaishaDbContext db) =>
{
    // Generate order ID
    var todayStr = DateTime.Now.ToString("ddMMyy");
    var totalOrdersCount = await db.Orders.CountAsync() + 101;
    var orderId = $"ORD-{totalOrdersCount}";

    var newOrder = new Order
    {
        Id = orderId,
        Customer = req.Customer,
        Tower = req.Tower,
        Floor = req.Floor,
        Flat = req.Flat,
        Address = req.Address,
        Items = req.Items,
        Price = req.Price,
        Status = "New",
        Time = req.IsToday ? "Today, " + DateTime.Now.ToString("hh:mm tt") : "Booked",
        IsToday = req.IsToday,
        Remark = req.Remark
    };

    db.Orders.Add(newOrder);

    // Upsert customer list and stats
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Name == req.Customer);
    if (customer == null)
    {
        customer = new CustomerListItem
        {
            Name = req.Customer,
            Tower = req.Tower,
            Floor = req.Floor,
            Flat = req.Flat,
            Phone = "9876543210", // Default placeholder
            Orders = 1,
            Spent = req.Price,
            Favorite = req.Items.Split(',')[0]
        };
        db.Customers.Add(customer);
    }
    else
    {
        customer.Orders += 1;
        customer.Spent += req.Price;
    }

    await db.SaveChangesAsync();
    return Results.Ok(newOrder);
});

app.MapPost("/api/orders/{id}/accept", async (string id, AnshaishaDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order == null) return Results.NotFound();

    order.Status = "Preparing";
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Order accepted." });
});

app.MapPost("/api/orders/{id}/deliver", async (string id, AnshaishaDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order == null) return Results.NotFound();

    order.Status = "Delivered";
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Order marked delivered." });
});

app.MapPost("/api/orders/{id}/reject", async (string id, AnshaishaDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order == null) return Results.NotFound();

    db.Orders.Remove(order);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Order rejected/removed." });
});

// Bulk Orders APIs


app.MapPost("/api/orders/bulk-accept", async (BulkOrderRequest req, AnshaishaDbContext db) =>
{
    var orders = await db.Orders.Where(o => req.OrderIds.Contains(o.Id)).ToListAsync();
    foreach (var o in orders)
    {
        if (o.Status == "New") o.Status = "Preparing";
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Selected orders accepted." });
});

app.MapPost("/api/orders/bulk-deliver", async (BulkOrderRequest req, AnshaishaDbContext db) =>
{
    var orders = await db.Orders.Where(o => req.OrderIds.Contains(o.Id)).ToListAsync();
    foreach (var o in orders)
    {
        if (o.Status == "Preparing" || o.Status == "New") o.Status = "Delivered";
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Selected orders marked delivered." });
});

app.MapPost("/api/orders/bulk-delete", async (BulkOrderRequest req, AnshaishaDbContext db) =>
{
    var orders = await db.Orders.Where(o => req.OrderIds.Contains(o.Id)).ToListAsync();
    db.Orders.RemoveRange(orders);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Selected orders deleted." });
});

// --------------------------------------------------------------------------
// 6. API: Payments Operations
// --------------------------------------------------------------------------
app.MapPost("/api/payments/{id}/pay", async (string id, AnshaishaDbContext db) =>
{
    var payment = await db.Payments.FindAsync(id);
    if (payment == null) return Results.NotFound();

    payment.IsPaid = true;
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Payment recorded." });
});

// --------------------------------------------------------------------------
// 7. API: Expenses Operations
// --------------------------------------------------------------------------


app.MapPost("/api/expenses", async (CreateExpenseRequest req, AnshaishaDbContext db) =>
{
    var count = await db.Expenses.CountAsync() + 1;
    var expense = new Expense
    {
        Id = $"EXP-{count}",
        Category = req.Category,
        Icon = req.Icon,
        Amount = req.Amount,
        Notes = req.Notes
    };

    db.Expenses.Add(expense);
    await db.SaveChangesAsync();
    return Results.Ok(expense);
});

// --------------------------------------------------------------------------
// 8. API: Leave Management
// --------------------------------------------------------------------------


app.MapPost("/api/leave", async (UpdateLeaveRequest req, AnshaishaDbContext db) =>
{
    var config = await db.LeaveConfigs.FirstOrDefaultAsync();
    if (config == null)
    {
        config = new LeaveConfig();
        db.LeaveConfigs.Add(config);
    }

    config.Declared = req.Declared;
    config.DatesJson = JsonSerializer.Serialize(req.Dates);
    config.Reason = req.Reason;

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Leave config updated successfully." });
});

// --------------------------------------------------------------------------
// 9. API: Announcements
// --------------------------------------------------------------------------


app.MapPost("/api/announcements", async (UpdateAnnouncementRequest req, AnshaishaDbContext db) =>
{
    var ann = await db.Announcements.FirstOrDefaultAsync();
    if (ann == null)
    {
        ann = new Announcement();
        db.Announcements.Add(ann);
    }
    ann.Message = req.Message;
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Announcement updated successfully." });
});

// --------------------------------------------------------------------------
// 10. API: Customer Security PIN Operations
// --------------------------------------------------------------------------
app.MapPost("/api/customers/login/init", async (LoginInitRequest req, AnshaishaDbContext db) =>
{
    var normalizedPhone = req.Phone?.Trim();
    if (string.IsNullOrWhiteSpace(normalizedPhone)) return Results.BadRequest("Invalid phone number.");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == normalizedPhone);
    if (customer == null)
    {
        return Results.Ok(new { exists = false, hasPin = false });
    }

    return Results.Ok(new { exists = true, hasPin = !string.IsNullOrEmpty(customer.Pin) });
});

app.MapPost("/api/customers/login/verify", async (LoginVerifyRequest req, AnshaishaDbContext db) =>
{
    var normalizedPhone = req.Phone?.Trim();
    if (string.IsNullOrWhiteSpace(normalizedPhone)) return Results.BadRequest("Invalid phone number.");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == normalizedPhone);
    
    // Auto-create customer if they don't exist yet
    if (customer == null)
    {
        customer = new CustomerListItem
        {
            Name = "Resident",
            Phone = normalizedPhone,
            Tower = "Alexander",
            Floor = "1",
            Flat = "1",
            Orders = 0,
            Spent = 0,
            Favorite = "None",
            Pin = null
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
        return Results.Ok(customer);
    }

    // If customer has a PIN, verify it
    if (!string.IsNullOrEmpty(customer.Pin))
    {
        if (customer.Pin != req.Pin)
        {
            return Results.Json(new { message = "Incorrect security PIN. Please try again." }, statusCode: StatusCodes.Status401Unauthorized);
        }
    }

    return Results.Ok(customer);
});

app.MapPost("/api/customers/profile/update", async (UpdateProfileRequest req, AnshaishaDbContext db) =>
{
    var normalizedOldPhone = req.OldPhone?.Trim();
    var normalizedNewPhone = req.NewPhone?.Trim();
    if (string.IsNullOrWhiteSpace(normalizedOldPhone) || string.IsNullOrWhiteSpace(normalizedNewPhone)) 
        return Results.BadRequest("Invalid phone numbers.");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == normalizedOldPhone);
    if (customer == null)
    {
        customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == normalizedNewPhone);
        if (customer == null)
        {
            customer = new CustomerListItem { Phone = normalizedNewPhone };
            db.Customers.Add(customer);
        }
    }

    customer.Name = req.Name;
    customer.Phone = normalizedNewPhone;
    customer.Tower = req.Tower;
    customer.Floor = req.Floor;
    customer.Flat = req.Flat;

    await db.SaveChangesAsync();
    return Results.Ok(customer);
});

app.MapPost("/api/customers/set-pin", async (SetPinRequest req, AnshaishaDbContext db) =>
{
    var normalizedPhone = req.Phone?.Trim();
    if (string.IsNullOrWhiteSpace(normalizedPhone)) return Results.BadRequest("Invalid phone number.");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == normalizedPhone);
    if (customer == null)
    {
        customer = new CustomerListItem
        {
            Name = "Resident",
            Phone = normalizedPhone,
            Tower = "Alexander",
            Floor = "1",
            Flat = "1",
            Orders = 0,
            Spent = 0,
            Favorite = "None",
            Pin = req.Pin
        };
        db.Customers.Add(customer);
    }
    else
    {
        customer.Pin = string.IsNullOrWhiteSpace(req.Pin) ? null : req.Pin.Trim();
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Security PIN updated successfully." });
});

app.MapPost("/api/customers/reset-pin", async (LoginInitRequest req, AnshaishaDbContext db) =>
{
    var normalizedPhone = req.Phone?.Trim();
    if (string.IsNullOrWhiteSpace(normalizedPhone)) return Results.BadRequest("Invalid phone number.");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Phone == normalizedPhone);
    if (customer == null)
    {
        return Results.NotFound(new { message = "Customer not found." });
    }

    customer.Pin = null;
    await db.SaveChangesAsync();
    return Results.Ok(new { message = $"Security PIN for {customer.Name} has been cleared successfully." });
});

app.MapGet("/admin", (HttpContext context) =>
{
    context.Response.Redirect("/index.html?role=admin");
    return Task.CompletedTask;
});

app.Run();
