using System;
using System.ComponentModel.DataAnnotations;

namespace AnshaishaBackend.Models;

public class MenuConfig
{
    [Key]
    public int Id { get; set; } = 1;
    public string Session { get; set; } = "Lunch";
    public string GraphicTemplate { get; set; } = "saffron";
    public string MealDescription { get; set; } = "1 Dal Tadka, 1 Aloo Gobhi Sabji, 4 Rotis, 1 Bowl Rice, Salad, Chutney";
    public decimal MealPrice { get; set; } = 200;
    public decimal AddonRoti { get; set; } = 10;
    public decimal AddonRice { get; set; } = -20;
    public decimal AddonSabji { get; set; } = 40;
    public bool KitchenClosedToday { get; set; } = false;
}

public class MenuItem
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool Checked { get; set; }
    public bool IsMeal { get; set; }
}

public class Order
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public string Tower { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Flat { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Items { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = "New"; // New | Preparing | Delivered
    public string Time { get; set; } = string.Empty;
    public bool IsToday { get; set; } = true;
    public string Remark { get; set; } = string.Empty;
    public bool IsPaid { get; set; } = false;
}

public class Payment
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public string Tower { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Flat { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int DaysDue { get; set; }
    public string Level { get; set; } = "normal"; // normal | warning | critical
    public bool IsPaid { get; set; } = false;
}

public class Expense
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class CustomerListItem
{
    [Key]
    public string Phone { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Tower { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Flat { get; set; } = string.Empty;
    public int Orders { get; set; }
    public decimal Spent { get; set; }
    public string Favorite { get; set; } = string.Empty;
    public string? Pin { get; set; }
}

public class Announcement
{
    [Key]
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class LeaveConfig
{
    [Key]
    public int Id { get; set; } = 1;
    public bool Declared { get; set; }
    public string DatesJson { get; set; } = "[]";
    public string Reason { get; set; } = string.Empty;
}

public record PublishMenuRequest(
    string Session, 
    string MealDescription, 
    decimal AddonRoti, 
    decimal AddonRice, 
    decimal AddonSabji, 
    System.Collections.Generic.List<int> CheckedItemIds
);

public record CustomDishRequest(string Name, decimal Price);

public record CreateOrderRequest(
    string Customer, 
    string Phone,
    string Tower, 
    string Floor, 
    string Flat, 
    string Address, 
    string Items, 
    decimal Price, 
    string Remark,
    bool IsToday,
    bool? IsPaid = false
);

public record BulkOrderRequest(System.Collections.Generic.List<string> OrderIds);

public record CreateExpenseRequest(string Category, string Icon, decimal Amount, string Notes);

public record UpdateLeaveRequest(bool Declared, System.Collections.Generic.List<string> Dates, string Reason);

public record UpdateAnnouncementRequest(string Message);

public record LoginInitRequest(string Phone);
public record LoginVerifyRequest(string Phone, string? Pin);
public record SetPinRequest(string Phone, string? Pin);
public record KitchenToggleRequest(bool IsClosed);
public record UpdateProfileRequest(string OldPhone, string NewPhone, string Name, string Tower, string Floor, string Flat);
