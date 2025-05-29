using CalorieManagement.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace CalorieManagement.Application.DTOs;

// Diet Log DTOs
public class DietLogDto
{
    public int Id { get; set; }
    public int FoodId { get; set; }
    public string FoodName { get; set; } = string.Empty;
    public double Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fat { get; set; }
    public DateTime LoggedAt { get; set; }
    public string MealType { get; set; } = string.Empty;
}

public class CreateDietLogDto
{
    [Required]
    public int FoodId { get; set; }

    [Required]
    [Range(0.1, 10000, ErrorMessage = "Quantity must be between 0.1 and 10000")]
    public double Quantity { get; set; }

    [Required]
    public string Unit { get; set; } = "grams";

    public DateTime? LoggedAt { get; set; }

    [Required]
    public string MealType { get; set; } = "Other";
}

public class UpdateDietLogDto
{
    [Required]
    [Range(0.1, 10000, ErrorMessage = "Quantity must be between 0.1 and 10000")]
    public double Quantity { get; set; }

    [Required]
    public string Unit { get; set; } = "grams";

    [Required]
    public string MealType { get; set; } = "Other";
}

// Achievement DTOs
public class AchievementDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AchievementType Type { get; set; }
    public string IconUrl { get; set; } = string.Empty;
    public int RequiredValue { get; set; }
    public int Points { get; set; }
}

public class UserAchievementDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AchievementType Type { get; set; }
    public string IconUrl { get; set; } = string.Empty;
    public int RequiredValue { get; set; }
    public int Points { get; set; }
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    public int CurrentProgress { get; set; }
}

public class CreateAchievementDto
{
    [Required]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;

    [Required]
    public AchievementType Type { get; set; }

    public string? IconUrl { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Required value must be greater than 0")]
    public int RequiredValue { get; set; }

    [Required]
    [Range(1, 1000, ErrorMessage = "Points must be between 1 and 1000")]
    public int Points { get; set; }
}

// Streak DTOs
public class StreakDto
{
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public bool IsActiveToday { get; set; }
}

public class CalendarDayDto
{
    public DateTime Date { get; set; }
    public bool HasActivity { get; set; }
    public int CurrentStreak { get; set; }
    public bool IsToday { get; set; }
}


