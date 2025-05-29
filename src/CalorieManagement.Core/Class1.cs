using Microsoft.AspNetCore.Identity;

namespace CalorieManagement.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public UserProfile? UserProfile { get; set; }
    public ICollection<UserExerciseLog> ExerciseLogs { get; set; } = new List<UserExerciseLog>();
    public ICollection<UserDietLog> DietLogs { get; set; } = new List<UserDietLog>();
    public ICollection<UserAchievement> Achievements { get; set; } = new List<UserAchievement>();
    public ICollection<StreakRecord> StreakRecords { get; set; } = new List<StreakRecord>();
    public ICollection<WeightRecord> WeightRecords { get; set; } = new List<WeightRecord>();
}
