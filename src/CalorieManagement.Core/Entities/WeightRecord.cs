namespace CalorieManagement.Core.Entities;

public class WeightRecord
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public double Weight { get; set; } // in kg
    public DateTime RecordedDate { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
}
