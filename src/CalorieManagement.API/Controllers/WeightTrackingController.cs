using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CalorieManagement.Application.DTOs;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WeightTrackingController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public WeightTrackingController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetWeightRecords([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var records = await _unitOfWork.WeightRecords.FindAsync(w => w.UserId == userId);
        var orderedRecords = records.OrderByDescending(w => w.RecordedDate)
                                   .Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .Select(w => new WeightRecordDto
                                   {
                                       Id = w.Id,
                                       UserId = w.UserId,
                                       Weight = w.Weight,
                                       RecordedDate = w.RecordedDate,
                                       Notes = w.Notes,
                                       CreatedAt = w.CreatedAt
                                   })
                                   .ToList();

        return Ok(orderedRecords);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWeightRecord(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var record = await _unitOfWork.WeightRecords.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
        if (record == null)
            return NotFound();

        var recordDto = new WeightRecordDto
        {
            Id = record.Id,
            UserId = record.UserId,
            Weight = record.Weight,
            RecordedDate = record.RecordedDate,
            Notes = record.Notes,
            CreatedAt = record.CreatedAt
        };

        return Ok(recordDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWeightRecord([FromBody] CreateWeightRecordDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Check if a record already exists for this date
        var existingRecord = await _unitOfWork.WeightRecords.FirstOrDefaultAsync(
            w => w.UserId == userId && w.RecordedDate.Date == model.RecordedDate.Date);

        if (existingRecord != null)
            return BadRequest("A weight record already exists for this date. Please update the existing record or choose a different date.");

        var weightRecord = new WeightRecord
        {
            UserId = userId,
            Weight = model.Weight,
            RecordedDate = model.RecordedDate,
            Notes = model.Notes
        };

        await _unitOfWork.WeightRecords.AddAsync(weightRecord);
        await _unitOfWork.SaveChangesAsync();

        // Update user profile with latest weight if this is the most recent record
        var profile = await _unitOfWork.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile != null)
        {
            var latestRecord = await _unitOfWork.WeightRecords
                .FindAsync(w => w.UserId == userId);
            var mostRecent = latestRecord.OrderByDescending(w => w.RecordedDate).FirstOrDefault();
            
            if (mostRecent?.Id == weightRecord.Id)
            {
                profile.Weight = weightRecord.Weight;
                profile.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.UserProfiles.UpdateAsync(profile);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        var recordDto = new WeightRecordDto
        {
            Id = weightRecord.Id,
            UserId = weightRecord.UserId,
            Weight = weightRecord.Weight,
            RecordedDate = weightRecord.RecordedDate,
            Notes = weightRecord.Notes,
            CreatedAt = weightRecord.CreatedAt
        };

        return CreatedAtAction(nameof(GetWeightRecord), new { id = weightRecord.Id }, recordDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWeightRecord(int id, [FromBody] UpdateWeightRecordDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var record = await _unitOfWork.WeightRecords.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
        if (record == null)
            return NotFound();

        // Update only provided fields
        if (model.Weight.HasValue) record.Weight = model.Weight.Value;
        if (model.RecordedDate.HasValue) record.RecordedDate = model.RecordedDate.Value;
        if (model.Notes != null) record.Notes = model.Notes;

        await _unitOfWork.WeightRecords.UpdateAsync(record);
        await _unitOfWork.SaveChangesAsync();

        var recordDto = new WeightRecordDto
        {
            Id = record.Id,
            UserId = record.UserId,
            Weight = record.Weight,
            RecordedDate = record.RecordedDate,
            Notes = record.Notes,
            CreatedAt = record.CreatedAt
        };

        return Ok(recordDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWeightRecord(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var record = await _unitOfWork.WeightRecords.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
        if (record == null)
            return NotFound();

        await _unitOfWork.WeightRecords.DeleteAsync(record);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("progress")]
    public async Task<IActionResult> GetWeightProgress()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var records = await _unitOfWork.WeightRecords.FindAsync(w => w.UserId == userId);
        var orderedRecords = records.OrderByDescending(w => w.RecordedDate).ToList();

        if (!orderedRecords.Any())
            return Ok(new WeightProgressDto());

        var profile = await _unitOfWork.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        var currentWeight = orderedRecords.First().Weight;
        var previousWeight = orderedRecords.Count > 1 ? orderedRecords[1].Weight : (double?)null;

        var recentRecords = orderedRecords.Take(10).Select(w => new WeightRecordDto
        {
            Id = w.Id,
            UserId = w.UserId,
            Weight = w.Weight,
            RecordedDate = w.RecordedDate,
            Notes = w.Notes,
            CreatedAt = w.CreatedAt
        }).ToList();

        var trend = CalculateWeightTrend(orderedRecords);

        var progress = new WeightProgressDto
        {
            CurrentWeight = currentWeight,
            PreviousWeight = previousWeight,
            WeightChange = previousWeight.HasValue ? currentWeight - previousWeight.Value : null,
            TargetWeight = profile?.TargetWeight,
            WeightToTarget = profile?.TargetWeight != null ? currentWeight - profile.TargetWeight : null,
            LastRecordedDate = orderedRecords.First().RecordedDate,
            RecentRecords = recentRecords,
            Trend = trend
        };

        return Ok(progress);
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetWeightStatistics()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var records = await _unitOfWork.WeightRecords.FindAsync(w => w.UserId == userId);
        var recordsList = records.ToList();

        if (!recordsList.Any())
            return Ok(new WeightStatisticsDto());

        var orderedRecords = recordsList.OrderBy(w => w.RecordedDate).ToList();
        var highestWeight = recordsList.Max(w => w.Weight);
        var lowestWeight = recordsList.Min(w => w.Weight);
        var highestWeightRecord = recordsList.First(w => w.Weight == highestWeight);
        var lowestWeightRecord = recordsList.First(w => w.Weight == lowestWeight);

        var firstWeight = orderedRecords.First().Weight;
        var lastWeight = orderedRecords.Last().Weight;
        var totalChange = lastWeight - firstWeight;

        var statistics = new WeightStatisticsDto
        {
            HighestWeight = highestWeight,
            LowestWeight = lowestWeight,
            HighestWeightDate = highestWeightRecord.RecordedDate,
            LowestWeightDate = lowestWeightRecord.RecordedDate,
            TotalWeightLost = totalChange < 0 ? Math.Abs(totalChange) : 0,
            TotalWeightGained = totalChange > 0 ? totalChange : 0,
            TotalRecords = recordsList.Count,
            DaysTracking = (int)(orderedRecords.Last().RecordedDate - orderedRecords.First().RecordedDate).TotalDays + 1
        };

        return Ok(statistics);
    }

    private WeightTrendDto CalculateWeightTrend(List<WeightRecord> orderedRecords)
    {
        if (orderedRecords.Count < 2)
            return new WeightTrendDto { Direction = "Stable", TrendDescription = "Not enough data to determine trend" };

        var recentRecords = orderedRecords.Take(4).ToList();
        var weeklyChange = recentRecords.Count >= 2 ? 
            (recentRecords.First().Weight - recentRecords.Last().Weight) / (recentRecords.Count - 1) : 0;

        var monthlyRecords = orderedRecords.Where(r => r.RecordedDate >= DateTime.Now.AddDays(-30)).ToList();
        var monthlyChange = monthlyRecords.Count >= 2 ?
            (monthlyRecords.OrderByDescending(r => r.RecordedDate).First().Weight - 
             monthlyRecords.OrderBy(r => r.RecordedDate).First().Weight) : 0;

        var direction = Math.Abs(weeklyChange) < 0.1 ? "Stable" : 
                       weeklyChange > 0 ? "Increasing" : "Decreasing";

        var description = direction switch
        {
            "Increasing" => $"Your weight is trending upward by approximately {Math.Abs(weeklyChange):F1} kg per week",
            "Decreasing" => $"Your weight is trending downward by approximately {Math.Abs(weeklyChange):F1} kg per week",
            _ => "Your weight has been relatively stable"
        };

        return new WeightTrendDto
        {
            Direction = direction,
            AverageWeeklyChange = weeklyChange,
            AverageMonthlyChange = monthlyChange,
            TrendDescription = description
        };
    }
}
