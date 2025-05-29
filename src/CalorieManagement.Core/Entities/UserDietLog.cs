namespace CalorieManagement.Core.Entities;

public class UserDietLog
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int FoodId { get; set; }
    public double Quantity { get; set; } // in grams
    public string Unit { get; set; } = "grams"; // Unit of measurement
    public double CaloriesConsumed { get; set; }
    public double ProteinConsumed { get; set; }
    public double CarbsConsumed { get; set; }
    public double FatConsumed { get; set; }
    public string MealType { get; set; } = string.Empty; // Breakfast, Lunch, Dinner, Snack
    public string Notes { get; set; } = string.Empty;
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    public DateTime MealDate { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Food Food { get; set; } = null!;
}
