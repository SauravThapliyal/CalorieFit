using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;
using CalorieManagement.Application.DTOs;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WeightController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public WeightController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetWeightRecords([FromQuery] int days = 30)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var startDate = DateTime.Today.AddDays(-days);
        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(
            wr => wr.UserId == userId && wr.RecordedDate >= startDate);

        var weightRecordDtos = weightRecords
            .OrderBy(wr => wr.RecordedDate)
            .Select(wr => new WeightRecordDto
            {
                Id = wr.Id,
                Weight = wr.Weight,
                RecordedDate = wr.RecordedDate,
                Notes = wr.Notes,
                UserId = wr.UserId,
                CreatedAt = wr.CreatedAt
            })
            .ToList();

        return Ok(weightRecordDtos);
    }

    [HttpPost]
    public async Task<IActionResult> LogWeight([FromBody] CreateWeightRecordDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Check if there's already a record for today
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);
        var existingRecords = await _unitOfWork.WeightRecords.FindAsync(
            wr => wr.UserId == userId &&
                  wr.RecordedDate >= today &&
                  wr.RecordedDate < tomorrow);

        var existingRecord = existingRecords.FirstOrDefault();

        if (existingRecord != null)
        {
            // Update existing record
            existingRecord.Weight = model.Weight;
            existingRecord.Notes = model.Notes ?? string.Empty;
            existingRecord.RecordedDate = DateTime.Today;

            // No Update method needed, just save changes
            await _unitOfWork.SaveChangesAsync();

            var updatedDto = new WeightRecordDto
            {
                Id = existingRecord.Id,
                Weight = existingRecord.Weight,
                RecordedDate = existingRecord.RecordedDate,
                Notes = existingRecord.Notes,
                UserId = existingRecord.UserId,
                CreatedAt = existingRecord.CreatedAt
            };

            return Ok(updatedDto);
        }
        else
        {
            // Create new record
            var weightRecord = new WeightRecord
            {
                UserId = userId,
                Weight = model.Weight,
                Notes = model.Notes ?? string.Empty,
                RecordedDate = DateTime.Today
            };

            await _unitOfWork.WeightRecords.AddAsync(weightRecord);
            await _unitOfWork.SaveChangesAsync();

            var weightRecordDto = new WeightRecordDto
            {
                Id = weightRecord.Id,
                Weight = weightRecord.Weight,
                RecordedDate = weightRecord.RecordedDate,
                Notes = weightRecord.Notes,
                UserId = weightRecord.UserId,
                CreatedAt = weightRecord.CreatedAt
            };

            return CreatedAtAction(nameof(GetWeightRecord), new { id = weightRecord.Id }, weightRecordDto);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWeightRecord(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(
            wr => wr.Id == id && wr.UserId == userId);

        var weightRecord = weightRecords.FirstOrDefault();
        if (weightRecord == null)
            return NotFound();

        var weightRecordDto = new WeightRecordDto
        {
            Id = weightRecord.Id,
            Weight = weightRecord.Weight,
            RecordedDate = weightRecord.RecordedDate,
            Notes = weightRecord.Notes,
            UserId = weightRecord.UserId,
            CreatedAt = weightRecord.CreatedAt
        };

        return Ok(weightRecordDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWeightRecord(int id, [FromBody] UpdateWeightRecordDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(
            wr => wr.Id == id && wr.UserId == userId);

        var weightRecord = weightRecords.FirstOrDefault();
        if (weightRecord == null)
            return NotFound();

        if (model.Weight.HasValue)
            weightRecord.Weight = model.Weight.Value;
        weightRecord.Notes = model.Notes ?? weightRecord.Notes;
        if (model.RecordedDate.HasValue)
            weightRecord.RecordedDate = model.RecordedDate.Value;

        // No Update method needed, just save changes
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWeightRecord(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(
            wr => wr.Id == id && wr.UserId == userId);

        var weightRecord = weightRecords.FirstOrDefault();
        if (weightRecord == null)
            return NotFound();

        await _unitOfWork.WeightRecords.DeleteAsync(weightRecord);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("progress")]
    public async Task<IActionResult> GetWeightProgress()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(wr => wr.UserId == userId);
        var orderedRecords = weightRecords.OrderBy(wr => wr.RecordedDate).ToList();

        if (!orderedRecords.Any())
        {
            return Ok(new
            {
                HasData = false,
                Message = "No weight records found"
            });
        }

        var firstRecord = orderedRecords.First();
        var lastRecord = orderedRecords.Last();
        var weightChange = lastRecord.Weight - firstRecord.Weight;

        // Get user's target weight
        var userProfiles = await _unitOfWork.UserProfiles.FindAsync(up => up.UserId == userId);
        var userProfile = userProfiles.FirstOrDefault();

        var progress = new
        {
            HasData = true,
            StartWeight = firstRecord.Weight,
            CurrentWeight = lastRecord.Weight,
            TargetWeight = userProfile?.TargetWeight,
            WeightChange = Math.Round(weightChange, 2),
            WeightChangeAbs = Math.Round(Math.Abs(weightChange), 2),
            IsGaining = weightChange > 0,
            IsLosing = weightChange < 0,
            IsMaintaining = Math.Abs(weightChange) < 0.5,
            FirstRecordDate = firstRecord.RecordedDate,
            LastRecordDate = lastRecord.RecordedDate,
            TotalDays = (lastRecord.RecordedDate - firstRecord.RecordedDate).Days,
            Records = orderedRecords.Select(wr => new
            {
                Weight = wr.Weight,
                Date = wr.RecordedDate.Date,
                Notes = wr.Notes
            }).ToList()
        };

        // Calculate progress towards target if available
        if (userProfile?.TargetWeight != null)
        {
            var targetDifference = userProfile.TargetWeight - firstRecord.Weight;
            var currentProgress = lastRecord.Weight - firstRecord.Weight;

            if (Math.Abs(targetDifference) > 0.1) // Avoid division by zero
            {
                var progressPercentage = Math.Round((currentProgress / targetDifference) * 100, 1);

                return Ok(new
                {
                    progress.HasData,
                    progress.StartWeight,
                    progress.CurrentWeight,
                    progress.TargetWeight,
                    progress.WeightChange,
                    progress.WeightChangeAbs,
                    progress.IsGaining,
                    progress.IsLosing,
                    progress.IsMaintaining,
                    progress.FirstRecordDate,
                    progress.LastRecordDate,
                    progress.TotalDays,
                    progress.Records,
                    ProgressToTarget = progressPercentage,
                    RemainingToTarget = Math.Round(userProfile.TargetWeight - lastRecord.Weight, 2)
                });
            }
        }

        return Ok(progress);
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestWeight()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(wr => wr.UserId == userId);
        var latestRecord = weightRecords.OrderByDescending(wr => wr.RecordedDate).FirstOrDefault();

        if (latestRecord == null)
        {
            return Ok(new
            {
                HasRecord = false,
                Message = "No weight records found"
            });
        }

        return Ok(new
        {
            HasRecord = true,
            Weight = latestRecord.Weight,
            RecordedAt = latestRecord.RecordedDate,
            Notes = latestRecord.Notes,
            DaysAgo = (DateTime.Today - latestRecord.RecordedDate.Date).Days
        });
    }
}
