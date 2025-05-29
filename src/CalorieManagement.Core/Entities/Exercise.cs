using CalorieManagement.Core.Enums;

namespace CalorieManagement.Core.Entities;

public class Exercise
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
    public string MuscleGroups { get; set; } = string.Empty; // JSON array of muscle groups
    public string Equipment { get; set; } = string.Empty; // JSON array of equipment needed
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<UserExerciseLog> UserExerciseLogs { get; set; } = new List<UserExerciseLog>();
}
