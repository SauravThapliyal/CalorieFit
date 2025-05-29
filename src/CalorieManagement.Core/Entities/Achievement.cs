using CalorieManagement.Core.Enums;

namespace CalorieManagement.Core.Entities;

public class Achievement
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AchievementType Type { get; set; }
    public string IconUrl { get; set; } = string.Empty;
    public int RequiredValue { get; set; } // e.g., 10 for "10 day streak"
    public int Points { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<UserAchievement> UserAchievements { get; set; } = new List<UserAchievement>();
}

public class UserAchievement
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int AchievementId { get; set; }
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Achievement Achievement { get; set; } = null!;
}
