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
public class StreakController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public StreakController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentStreak()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var streakRecords = await _unitOfWork.StreakRecords.FindAsync(sr => sr.UserId == userId);
        var currentStreak = streakRecords.OrderByDescending(sr => sr.LastActivityDate).FirstOrDefault();

        if (currentStreak == null)
        {
            return Ok(new StreakDto
            {
                CurrentStreak = 0,
                LongestStreak = 0,
                LastActivityDate = null,
                IsActiveToday = false
            });
        }

        var isActiveToday = await IsActiveToday(userId);

        return Ok(new StreakDto
        {
            CurrentStreak = currentStreak.CurrentStreak,
            LongestStreak = currentStreak.LongestStreak,
            LastActivityDate = currentStreak.Date,
            IsActiveToday = isActiveToday
        });
    }

    [HttpPost("update")]
    public async Task<IActionResult> UpdateStreak()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var today = DateTime.Today;
        var isActiveToday = await IsActiveToday(userId);

        if (!isActiveToday)
        {
            return BadRequest("No activity logged for today");
        }

        var streakRecords = await _unitOfWork.StreakRecords.FindAsync(sr => sr.UserId == userId);
        var todayStreak = streakRecords.FirstOrDefault(sr => sr.Date.Date == today);

        if (todayStreak != null)
        {
            // Already updated today
            return Ok(new StreakDto
            {
                CurrentStreak = todayStreak.CurrentStreak,
                LongestStreak = todayStreak.LongestStreak,
                LastActivityDate = todayStreak.Date,
                IsActiveToday = true
            });
        }

        var yesterday = today.AddDays(-1);
        var yesterdayStreak = streakRecords.FirstOrDefault(sr => sr.Date.Date == yesterday);

        int newCurrentStreak;
        int longestStreak;

        if (yesterdayStreak != null)
        {
            // Continue streak
            newCurrentStreak = yesterdayStreak.CurrentStreak + 1;
            longestStreak = Math.Max(yesterdayStreak.LongestStreak, newCurrentStreak);
        }
        else
        {
            // Check if there was any recent activity (within last 2 days)
            var recentStreak = streakRecords
                .Where(sr => sr.Date.Date >= today.AddDays(-2))
                .OrderByDescending(sr => sr.Date)
                .FirstOrDefault();

            if (recentStreak != null && recentStreak.Date.Date == today.AddDays(-2))
            {
                // There was a gap yesterday, reset streak
                newCurrentStreak = 1;
                longestStreak = Math.Max(recentStreak.LongestStreak, 1);
            }
            else
            {
                // Starting fresh or continuing from older streak
                var latestStreak = streakRecords.OrderByDescending(sr => sr.Date).FirstOrDefault();
                newCurrentStreak = 1;
                longestStreak = latestStreak?.LongestStreak ?? 1;
            }
        }

        var newStreakRecord = new StreakRecord
        {
            UserId = userId,
            Date = today,
            CurrentStreak = newCurrentStreak,
            LongestStreak = longestStreak
        };

        await _unitOfWork.StreakRecords.AddAsync(newStreakRecord);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new StreakDto
        {
            CurrentStreak = newCurrentStreak,
            LongestStreak = longestStreak,
            LastActivityDate = today,
            IsActiveToday = true
        });
    }

    [HttpGet("calendar")]
    public async Task<IActionResult> GetStreakCalendar([FromQuery] int year = 0, [FromQuery] int month = 0)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        if (year == 0) year = DateTime.Now.Year;
        if (month == 0) month = DateTime.Now.Month;

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var streakRecords = await _unitOfWork.StreakRecords.FindAsync(
            sr => sr.UserId == userId &&
                  sr.Date >= startDate &&
                  sr.Date <= endDate);

        var calendarData = new List<CalendarDayDto>();

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var hasActivity = await HasActivityOnDate(userId, date);
            var streakRecord = streakRecords.FirstOrDefault(sr => sr.Date.Date == date.Date);

            calendarData.Add(new CalendarDayDto
            {
                Date = date,
                HasActivity = hasActivity,
                CurrentStreak = streakRecord?.CurrentStreak ?? 0,
                IsToday = date.Date == DateTime.Today
            });
        }

        return Ok(new
        {
            Year = year,
            Month = month,
            Days = calendarData
        });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStreakStats()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var streakRecords = await _unitOfWork.StreakRecords.FindAsync(sr => sr.UserId == userId);
        var currentStreak = streakRecords.OrderByDescending(sr => sr.Date).FirstOrDefault();

        var longestStreak = streakRecords.Any() ? streakRecords.Max(sr => sr.LongestStreak) : 0;
        var totalActiveDays = streakRecords.Count();

        // Calculate this month's active days
        var thisMonth = DateTime.Today.Month;
        var thisYear = DateTime.Today.Year;
        var thisMonthActiveDays = streakRecords.Count(sr => sr.Date.Month == thisMonth && sr.Date.Year == thisYear);

        // Calculate this week's active days
        var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(6);
        var thisWeekActiveDays = streakRecords.Count(sr => sr.Date >= startOfWeek && sr.Date <= endOfWeek);

        return Ok(new
        {
            CurrentStreak = currentStreak?.CurrentStreak ?? 0,
            LongestStreak = longestStreak,
            TotalActiveDays = totalActiveDays,
            ThisMonthActiveDays = thisMonthActiveDays,
            ThisWeekActiveDays = thisWeekActiveDays,
            IsActiveToday = await IsActiveToday(userId)
        });
    }

    private async Task<bool> IsActiveToday(string userId)
    {
        return await HasActivityOnDate(userId, DateTime.Today);
    }

    private async Task<bool> HasActivityOnDate(string userId, DateTime date)
    {
        var nextDay = date.AddDays(1);

        // Check for diet logs
        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(
            dl => dl.UserId == userId &&
                  dl.LoggedAt >= date &&
                  dl.LoggedAt < nextDay);

        if (dietLogs.Any())
            return true;

        // Check for exercise logs
        var exerciseLogs = await _unitOfWork.UserExerciseLogs.FindAsync(
            el => el.UserId == userId &&
                  el.LoggedAt >= date &&
                  el.LoggedAt < nextDay);

        return exerciseLogs.Any();
    }
}
