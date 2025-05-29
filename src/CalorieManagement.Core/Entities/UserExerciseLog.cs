namespace CalorieManagement.Core.Entities;

public class UserExerciseLog
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public int DurationMinutes { get; set; }
    public double CaloriesBurned { get; set; }
    public int? Sets { get; set; }
    public int? Reps { get; set; }
    public double? Weight { get; set; } // for strength training
    public string Notes { get; set; } = string.Empty;
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExerciseDate { get; set; }
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
}
