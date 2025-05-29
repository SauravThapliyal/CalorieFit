using System.ComponentModel.DataAnnotations;
using CalorieManagement.Core.Enums;

namespace CalorieManagement.Application.DTOs;

public class CreateUserProfileDto
{
    [Required]
    [Range(30, 300, ErrorMessage = "Weight must be between 30 and 300 kg")]
    public double Weight { get; set; }

    [Required]
    [Range(1.0, 2.5, ErrorMessage = "Height must be between 1.0 and 2.5 meters")]
    public double Height { get; set; }

    [Required]
    [Range(13, 120, ErrorMessage = "Age must be between 13 and 120 years")]
    public int Age { get; set; }

    [Required]
    public Gender Gender { get; set; }

    [Required]
    public ActivityLevel ActivityLevel { get; set; }

    [Required]
    public FitnessGoal FitnessGoal { get; set; }

    [Range(30, 300, ErrorMessage = "Target weight must be between 30 and 300 kg")]
    public double TargetWeight { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public double Weight { get; set; }
    public double Height { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public ActivityLevel ActivityLevel { get; set; }
    public FitnessGoal FitnessGoal { get; set; }
    public double TargetWeight { get; set; }
    public double BMI { get; set; }
    public string BMICategory { get; set; } = string.Empty;
    public double DailyCalorieGoal { get; set; }
    public double DailyProteinGoal { get; set; }
    public string Recommendation { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// Food DTOs
public class FoodDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double CaloriesPer100g { get; set; }
    public double ProteinPer100g { get; set; }
    public double CarbsPer100g { get; set; }
    public double FatPer100g { get; set; }
    public double FiberPer100g { get; set; }
    public string Category { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class CreateFoodDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double CaloriesPer100g { get; set; }
    public double ProteinPer100g { get; set; }
    public double CarbsPer100g { get; set; }
    public double FatPer100g { get; set; }
    public double FiberPer100g { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class UpdateFoodDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double CaloriesPer100g { get; set; }
    public double ProteinPer100g { get; set; }
    public double CarbsPer100g { get; set; }
    public double FatPer100g { get; set; }
    public double FiberPer100g { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class UpdateUserProfileDto
{
    [Range(30, 300, ErrorMessage = "Weight must be between 30 and 300 kg")]
    public double? Weight { get; set; }

    [Range(1.0, 2.5, ErrorMessage = "Height must be between 1.0 and 2.5 meters")]
    public double? Height { get; set; }

    [Range(13, 120, ErrorMessage = "Age must be between 13 and 120 years")]
    public int? Age { get; set; }

    public Gender? Gender { get; set; }
    public ActivityLevel? ActivityLevel { get; set; }
    public FitnessGoal? FitnessGoal { get; set; }

    [Range(30, 300, ErrorMessage = "Target weight must be between 30 and 300 kg")]
    public double? TargetWeight { get; set; }
}
