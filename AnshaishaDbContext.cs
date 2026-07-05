using Microsoft.EntityFrameworkCore;
using AnshaishaBackend.Models;
using System.Collections.Generic;

namespace AnshaishaBackend;

public class AnshaishaDbContext : DbContext
{
    public AnshaishaDbContext(DbContextOptions<AnshaishaDbContext> options) : base(options) { }

    public DbSet<MenuConfig> MenuConfigs { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<CustomerListItem> Customers { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<LeaveConfig> LeaveConfigs { get; set; }

    public void SeedDefaultData()
    {
        // Clear all tables
        MenuConfigs.RemoveRange(MenuConfigs);
        MenuItems.RemoveRange(MenuItems);
        Orders.RemoveRange(Orders);
        Payments.RemoveRange(Payments);
        Expenses.RemoveRange(Expenses);
        Customers.RemoveRange(Customers);
        Announcements.RemoveRange(Announcements);
        LeaveConfigs.RemoveRange(LeaveConfigs);
        SaveChanges();

        // Seed MenuConfig
        MenuConfigs.Add(new MenuConfig
        {
            Id = 1,
            Session = "Lunch",
            GraphicTemplate = "saffron",
            MealDescription = "1 Dal Tadka, 1 Aloo Gobhi Sabji, 4 Rotis, 1 Bowl Rice, Salad, Chutney",
            MealPrice = 200,
            AddonRoti = 10,
            AddonRice = -20,
            AddonSabji = 40,
            KitchenClosedToday = false
        });

        // Seed MenuItems
        MenuItems.AddRange(new List<MenuItem>
        {
            new() { Id = 1, Name = "Anshaisha Complete Meal", Price = 200, Checked = true, IsMeal = true },
            new() { Id = 2, Name = "Paneer Butter Masala (Rich butter paneer gravy)", Price = 130, Checked = false, IsMeal = false },
            new() { Id = 3, Name = "Dal Tadka (Hygienic home style yellow dal)", Price = 100, Checked = false, IsMeal = false },
            new() { Id = 4, Name = "Jeera Rice (Basmati rice with cumin)", Price = 80, Checked = false, IsMeal = false },
            new() { Id = 5, Name = "Chapatis (Soft whole wheat rotis - pack of 3)", Price = 30, Checked = false, IsMeal = false },
            new() { Id = 6, Name = "Veg Biryani (Flavorful veg pulav with raita)", Price = 140, Checked = false, IsMeal = false }
        });

        // Seed Orders
        Orders.AddRange(new List<Order>
        {
            new() { Id = "ORD-101", Customer = "Amit Sharma", Tower = "Alexander", Floor = "22", Flat = "08", Address = "Alexander 2208", Items = "1x Complete Meal (Extra Roti)", Price = 210, Status = "Delivered", Time = "Today, 11:45 AM", IsToday = true, Remark = "Placed on App" },
            new() { Id = "ORD-102", Customer = "Sonia Kapoor", Tower = "Ceaser", Floor = "14", Flat = "02", Address = "Ceaser 1402", Items = "1x Complete Meal (No Rice)", Price = 180, Status = "Preparing", Time = "Today, 12:10 PM", IsToday = true, Remark = "Placed on App" },
            new() { Id = "ORD-103", Customer = "Major R. D. Singh", Tower = "Napoleon", Floor = "05", Flat = "04", Address = "Napoleon 0504", Items = "2x Complete Meal", Price = 400, Status = "New", Time = "Today, 12:15 PM", IsToday = true, Remark = "Received on Phone" },
            new() { Id = "ORD-104", Customer = "Vikram Malhotra", Tower = "Alexander", Floor = "11", Flat = "05", Address = "Alexander 1105", Items = "1x Paneer Butter Masala, 1x Jeera Rice", Price = 210, Status = "New", Time = "Tomorrow, 12:00 PM", IsToday = false, Remark = "Placed on App" },
            
            // History Orders
            new() { Id = "ORD-098", Customer = "Amit Sharma", Tower = "Alexander", Floor = "22", Flat = "08", Address = "Alexander 2208", Items = "1x Complete Meal (Extra Roti)", Price = 210, Status = "Delivered", Time = "June 18, 2026", IsToday = false, Remark = "Placed on App" },
            new() { Id = "ORD-097", Customer = "Sonia Kapoor", Tower = "Ceaser", Floor = "14", Flat = "02", Address = "Ceaser 1402", Items = "1x Complete Meal (No Rice)", Price = 180, Status = "Delivered", Time = "June 17, 2026", IsToday = false, Remark = "Received on Phone" },
            new() { Id = "ORD-096", Customer = "Rahul Verma", Tower = "Alexander", Floor = "31", Flat = "06", Address = "Alexander 3106", Items = "2x Complete Meal", Price = 400, Status = "Delivered", Time = "June 16, 2026", IsToday = false, Remark = "Placed on App" },
            new() { Id = "ORD-095", Customer = "Mrs. Iyer", Tower = "Napoleon", Floor = "18", Flat = "01", Address = "Napoleon 1801", Items = "1x Complete Meal", Price = 200, Status = "Delivered", Time = "June 15, 2026", IsToday = false, Remark = "Received on Phone" },
            new() { Id = "ORD-094", Customer = "Amit Sharma", Tower = "Alexander", Floor = "22", Flat = "08", Address = "Alexander 2208", Items = "1x Complete Meal", Price = 200, Status = "Delivered", Time = "June 14, 2026", IsToday = false, Remark = "Placed on App" }
        });

        // Seed Payments
        Payments.AddRange(new List<Payment>
        {
            new() { Id = "PAY-01", Customer = "Sonia Kapoor", Tower = "Ceaser", Floor = "14", Flat = "02", Address = "Ceaser 1402", Amount = 320, DaysDue = 3, Level = "warning", IsPaid = false },
            new() { Id = "PAY-02", Customer = "Rahul Verma", Tower = "Alexander", Floor = "31", Flat = "06", Address = "Alexander 3106", Amount = 560, DaysDue = 5, Level = "critical", IsPaid = false },
            new() { Id = "PAY-03", Customer = "Mrs. Iyer", Tower = "Napoleon", Floor = "18", Flat = "01", Address = "Napoleon 1801", Amount = 250, DaysDue = 1, Level = "normal", IsPaid = false },
            
            // Seed payment to pad initial revenue to 1950 (1400 delivered orders + 550 seeded resolved payment)
            new() { Id = "PAY-SEED-01", Customer = "System Seed", Amount = 550, IsPaid = true }
        });

        // Seed Expenses
        Expenses.AddRange(new List<Expense>
        {
            new() { Id = "EXP-01", Category = "Vegetables", Icon = "🥕", Amount = 450, Notes = "Tomato, onion, green chili" },
            new() { Id = "EXP-02", Category = "Packaging", Icon = "📦", Amount = 80, Notes = "Eco containers & bags" },
            new() { Id = "EXP-03", Category = "Gas", Icon = "🔥", Amount = 200, Notes = "Refill share" }
        });

        // Seed Customers
        Customers.AddRange(new List<CustomerListItem>
        {
            new() { Name = "Amit Sharma", Tower = "Alexander", Floor = "22", Flat = "08", Phone = "9876543210", Orders = 12, Spent = 2540, Favorite = "Complete Meal" },
            new() { Name = "Sonia Kapoor", Tower = "Ceaser", Floor = "14", Flat = "02", Phone = "9821034988", Orders = 8, Spent = 1680, Favorite = "Paneer Butter Masala" },
            new() { Name = "Rahul Verma", Tower = "Alexander", Floor = "31", Flat = "06", Phone = "9930048123", Orders = 15, Spent = 3120, Favorite = "Complete Meal" },
            new() { Name = "Mrs. Iyer", Tower = "Napoleon", Floor = "18", Flat = "01", Phone = "9819923455", Orders = 6, Spent = 1200, Favorite = "Complete Meal" }
        });

        // Seed Announcements
        Announcements.Add(new Announcement
        {
            Id = 1,
            Message = "Meenakashi: Lunch orders accepted till 11:30 AM. Fresh ingredients only!"
        });

        // Seed LeaveConfig
        LeaveConfigs.Add(new LeaveConfig
        {
            Id = 1,
            Declared = true,
            DatesJson = "[\"2026-06-25\", \"2026-06-26\"]",
            Reason = "Kitchen closed for family function"
        });

        SaveChanges();
    }
}
