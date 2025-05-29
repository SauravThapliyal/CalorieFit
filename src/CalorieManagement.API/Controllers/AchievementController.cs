using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;
using CalorieManagement.Application.DTOs;
using CalorieManagement.Core.Enums;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AchievementController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public AchievementController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAchievements()
    {
        var achievements = await _unitOfWork.Achievements.FindAsync(a => a.IsActive);

        var achievementDtos = achievements.Select(a => new AchievementDto
        {
            Id = a.Id,
            Name = a.Name,
            Description = a.Description,
            Type = a.Type,
            IconUrl = a.IconUrl,
            RequiredValue = a.RequiredValue,
            Points = a.Points
        }).ToList();

        return Ok(achievementDtos);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserAchievements()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var userAchievements = await _unitOfWork.UserAchievements.FindAsync(ua => ua.UserId == userId);
        var achievements = await _unitOfWork.Achievements.FindAsync(a => a.IsActive);

        var userAchievementDtos = new List<UserAchievementDto>();

        foreach (var achievement in achievements)
        {
            var userAchievement = userAchievements.FirstOrDefault(ua => ua.AchievementId == achievement.Id);

            userAchievementDtos.Add(new UserAchievementDto
            {
                Id = achievement.Id,
                Name = achievement.Name,
                Description = achievement.Description,
                Type = achievement.Type,
                IconUrl = achievement.IconUrl,
                RequiredValue = achievement.RequiredValue,
                Points = achievement.Points,
                IsUnlocked = userAchievement != null,
                UnlockedAt = userAchievement?.EarnedAt,
                CurrentProgress = await GetCurrentProgress(userId, achievement)
            });
        }

        var totalPoints = userAchievementDtos.Where(ua => ua.IsUnlocked).Sum(ua => ua.Points);

        return Ok(new
        {
            Achievements = userAchievementDtos,
            TotalPoints = totalPoints,
            UnlockedCount = userAchievementDtos.Count(ua => ua.IsUnlocked),
            TotalCount = userAchievementDtos.Count
        });
    }

    [HttpPost("check")]
    public async Task<IActionResult> CheckAchievements()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var newAchievements = await CheckAndUnlockAchievements(userId);

        return Ok(new
        {
            NewAchievements = newAchievements,
            Count = newAchievements.Count
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAchievement([FromBody] CreateAchievementDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var achievement = new Achievement
        {
            Name = model.Name,
            Description = model.Description,
            Type = model.Type,
            IconUrl = model.IconUrl ?? string.Empty,
            RequiredValue = model.RequiredValue,
            Points = model.Points
        };

        await _unitOfWork.Achievements.AddAsync(achievement);
        await _unitOfWork.SaveChangesAsync();

        var achievementDto = new AchievementDto
        {
            Id = achievement.Id,
            Name = achievement.Name,
            Description = achievement.Description,
            Type = achievement.Type,
            IconUrl = achievement.IconUrl,
            RequiredValue = achievement.RequiredValue,
            Points = achievement.Points
        };

        return CreatedAtAction(nameof(GetAchievement), new { id = achievement.Id }, achievementDto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAchievement(int id)
    {
        var achievement = await _unitOfWork.Achievements.GetByIdAsync(id);
        if (achievement == null || !achievement.IsActive)
            return NotFound();

        var achievementDto = new AchievementDto
        {
            Id = achievement.Id,
            Name = achievement.Name,
            Description = achievement.Description,
            Type = achievement.Type,
            IconUrl = achievement.IconUrl,
            RequiredValue = achievement.RequiredValue,
            Points = achievement.Points
        };

        return Ok(achievementDto);
    }

    private async Task<int> GetCurrentProgress(string userId, Achievement achievement)
    {
        return achievement.Type switch
        {
            AchievementType.DailyStreak => await GetCurrentStreak(userId),
            AchievementType.TotalWorkouts => await GetTotalWorkouts(userId),
            AchievementType.CaloriesBurned => await GetTotalCaloriesBurned(userId),
            AchievementType.WeightLoss => await GetWeightLossProgress(userId),
            AchievementType.ConsistentLogging => await GetConsistentLoggingDays(userId),
            _ => 0
        };
    }

    private async Task<int> GetCurrentStreak(string userId)
    {
        var streakRecords = await _unitOfWork.StreakRecords.FindAsync(sr => sr.UserId == userId);
        var currentStreak = streakRecords.OrderByDescending(sr => sr.LastActivityDate).FirstOrDefault();
        return currentStreak?.CurrentStreak ?? 0;
    }

    private async Task<int> GetTotalWorkouts(string userId)
    {
        var exerciseLogs = await _unitOfWork.UserExerciseLogs.FindAsync(el => el.UserId == userId);
        return exerciseLogs.Count();
    }

    private async Task<int> GetTotalCaloriesBurned(string userId)
    {
        var exerciseLogs = await _unitOfWork.UserExerciseLogs.FindAsync(el => el.UserId == userId);
        return (int)exerciseLogs.Sum(el => el.CaloriesBurned);
    }

    private async Task<int> GetWeightLossProgress(string userId)
    {
        var weightRecords = await _unitOfWork.WeightRecords.FindAsync(wr => wr.UserId == userId);
        var orderedRecords = weightRecords.OrderBy(wr => wr.RecordedDate).ToList();

        if (orderedRecords.Count < 2)
            return 0;

        var firstWeight = orderedRecords.First().Weight;
        var lastWeight = orderedRecords.Last().Weight;
        var weightLoss = firstWeight - lastWeight;

        return Math.Max(0, (int)Math.Round(weightLoss));
    }

    private async Task<int> GetConsistentLoggingDays(string userId)
    {
        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(dl => dl.UserId == userId);
        var exerciseLogs = await _unitOfWork.UserExerciseLogs.FindAsync(el => el.UserId == userId);

        var dietDays = dietLogs.Select(dl => dl.LoggedAt.Date).Distinct();
        var exerciseDays = exerciseLogs.Select(el => el.LoggedAt.Date).Distinct();
        var allLoggedDays = dietDays.Union(exerciseDays).Distinct();

        return allLoggedDays.Count();
    }

    private async Task<List<AchievementDto>> CheckAndUnlockAchievements(string userId)
    {
        var achievements = await _unitOfWork.Achievements.FindAsync(a => a.IsActive);
        var userAchievements = await _unitOfWork.UserAchievements.FindAsync(ua => ua.UserId == userId);
        var unlockedAchievementIds = userAchievements.Select(ua => ua.AchievementId).ToHashSet();

        var newAchievements = new List<AchievementDto>();

        foreach (var achievement in achievements)
        {
            if (unlockedAchievementIds.Contains(achievement.Id))
                continue;

            var currentProgress = await GetCurrentProgress(userId, achievement);

            if (currentProgress >= achievement.RequiredValue)
            {
                var userAchievement = new UserAchievement
                {
                    UserId = userId,
                    AchievementId = achievement.Id,
                    EarnedAt = DateTime.UtcNow
                };

                await _unitOfWork.UserAchievements.AddAsync(userAchievement);

                newAchievements.Add(new AchievementDto
                {
                    Id = achievement.Id,
                    Name = achievement.Name,
                    Description = achievement.Description,
                    Type = achievement.Type,
                    IconUrl = achievement.IconUrl,
                    RequiredValue = achievement.RequiredValue,
                    Points = achievement.Points
                });
            }
        }

        if (newAchievements.Any())
        {
            await _unitOfWork.SaveChangesAsync();
        }

        return newAchievements;
    }
}
