namespace CalorieManagement.Core.Entities;

public class Food
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double CaloriesPer100g { get; set; }
    public double ProteinPer100g { get; set; }
    public double CarbsPer100g { get; set; }
    public double FatPer100g { get; set; }
    public double FiberPer100g { get; set; }
    public string Category { get; set; } = string.Empty; // e.g., "Fruits", "Vegetables", "Proteins"
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<UserDietLog> UserDietLogs { get; set; } = new List<UserDietLog>();
}
