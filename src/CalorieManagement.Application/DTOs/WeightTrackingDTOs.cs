using System.ComponentModel.DataAnnotations;

namespace CalorieManagement.Application.DTOs;

public class CreateWeightRecordDto
{
    [Required]
    [Range(30, 300, ErrorMessage = "Weight must be between 30 and 300 kg")]
    public double Weight { get; set; }

    [Required]
    public DateTime RecordedDate { get; set; }

    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
    public string Notes { get; set; } = string.Empty;
}

public class WeightRecordDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public double Weight { get; set; }
    public DateTime RecordedDate { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UpdateWeightRecordDto
{
    [Range(30, 300, ErrorMessage = "Weight must be between 30 and 300 kg")]
    public double? Weight { get; set; }

    public DateTime? RecordedDate { get; set; }

    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
    public string? Notes { get; set; }
}

public class WeightProgressDto
{
    public double CurrentWeight { get; set; }
    public double? PreviousWeight { get; set; }
    public double? WeightChange { get; set; }
    public double? TargetWeight { get; set; }
    public double? WeightToTarget { get; set; }
    public DateTime? LastRecordedDate { get; set; }
    public List<WeightRecordDto> RecentRecords { get; set; } = new List<WeightRecordDto>();
    public WeightTrendDto Trend { get; set; } = new WeightTrendDto();
}

public class WeightTrendDto
{
    public string Direction { get; set; } = string.Empty; // "Increasing", "Decreasing", "Stable"
    public double AverageWeeklyChange { get; set; }
    public double AverageMonthlyChange { get; set; }
    public string TrendDescription { get; set; } = string.Empty;
}

public class WeightStatisticsDto
{
    public double HighestWeight { get; set; }
    public double LowestWeight { get; set; }
    public DateTime? HighestWeightDate { get; set; }
    public DateTime? LowestWeightDate { get; set; }
    public double TotalWeightLost { get; set; }
    public double TotalWeightGained { get; set; }
    public int TotalRecords { get; set; }
    public int DaysTracking { get; set; }
}
