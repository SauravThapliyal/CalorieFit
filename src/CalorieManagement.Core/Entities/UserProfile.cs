using CalorieManagement.Core.Enums;

namespace CalorieManagement.Core.Entities;

public class UserProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public double Weight { get; set; } // in kg
    public double Height { get; set; } // in meters
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public ActivityLevel ActivityLevel { get; set; }
    public FitnessGoal FitnessGoal { get; set; }
    public double TargetWeight { get; set; } // in kg
    public double BMI { get; set; }
    public string BMICategory { get; set; } = string.Empty;
    public double DailyCalorieGoal { get; set; }
    public double DailyProteinGoal { get; set; } // in grams
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
}
