using CalorieManagement.Core.Enums;

namespace CalorieManagement.Core.Entities;

public class StreakRecord
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public StreakType Type { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime Date { get; set; } // The date this streak record is for
    public DateTime LastActivityDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
}
