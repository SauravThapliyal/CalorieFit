using System.ComponentModel.DataAnnotations;
using CalorieManagement.Core.Enums;

namespace CalorieManagement.Application.DTOs;

public class ExerciseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public ExerciseType Type { get; set; }
    public ExerciseLocation Location { get; set; }
    public DifficultyLevel Difficulty { get; set; }
    public int DurationMinutes { get; set; }
    public double CaloriesBurnedPerMinute { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public List<string> MuscleGroups { get; set; } = new List<string>();
    public List<string> Equipment { get; set; } = new List<string>();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExerciseDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [StringLength(2000)]
    public string Instructions { get; set; } = string.Empty;

    [Required]
    public ExerciseType Type { get; set; }

    [Required]
    public ExerciseLocation Location { get; set; }

    [Required]
    public DifficultyLevel Difficulty { get; set; }

    [Range(1, 300)]
    public int DurationMinutes { get; set; }

    [Range(0.1, 50)]
    public double CaloriesBurnedPerMinute { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public List<string> MuscleGroups { get; set; } = new List<string>();
    public List<string> Equipment { get; set; } = new List<string>();
}

public class UpdateExerciseDto
{
    [StringLength(200)]
    public string? Name { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(2000)]
    public string? Instructions { get; set; }

    public ExerciseType? Type { get; set; }
    public ExerciseLocation? Location { get; set; }
    public DifficultyLevel? Difficulty { get; set; }

    [Range(1, 300)]
    public int? DurationMinutes { get; set; }

    [Range(0.1, 50)]
    public double? CaloriesBurnedPerMinute { get; set; }

    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public List<string>? MuscleGroups { get; set; }
    public List<string>? Equipment { get; set; }
    public bool? IsActive { get; set; }
}

public class UserExerciseLogDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public double CaloriesBurned { get; set; }
    public int? Sets { get; set; }
    public int? Reps { get; set; }
    public double? Weight { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime LoggedAt { get; set; }
    public DateTime ExerciseDate { get; set; }
}

public class CreateUserExerciseLogDto
{
    [Required]
    public int ExerciseId { get; set; }

    [Required]
    [Range(1, 600)]
    public int DurationMinutes { get; set; }

    [Range(1, 10000)]
    public double? CaloriesBurned { get; set; }

    [Range(1, 100)]
    public int? Sets { get; set; }

    [Range(1, 1000)]
    public int? Reps { get; set; }

    [Range(0.5, 1000)]
    public double? Weight { get; set; }

    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;

    [Required]
    public DateTime ExerciseDate { get; set; }
}
