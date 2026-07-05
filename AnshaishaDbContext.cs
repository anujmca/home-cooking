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

        // Seed default open LeaveConfig
        LeaveConfigs.Add(new LeaveConfig
        {
            Id = 1,
            Declared = false,
            DatesJson = "[]",
            Reason = ""
        });

        SaveChanges();
    }
}
