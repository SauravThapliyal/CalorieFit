using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;
using CalorieManagement.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DietLogController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public DietLogController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetDietLogs([FromQuery] DateTime? date = null)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var targetDate = date?.Date ?? DateTime.Today;
        var nextDay = targetDate.AddDays(1);

        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(
            dl => dl.UserId == userId &&
                  dl.LoggedAt >= targetDate &&
                  dl.LoggedAt < nextDay);

        var dietLogDtos = new List<DietLogDto>();
        foreach (var log in dietLogs)
        {
            var food = await _unitOfWork.Foods.GetByIdAsync(log.FoodId);
            if (food != null)
            {
                dietLogDtos.Add(new DietLogDto
                {
                    Id = log.Id,
                    FoodId = log.FoodId,
                    FoodName = food.Name,
                    Quantity = log.Quantity,
                    Unit = log.Unit,
                    Calories = log.CaloriesConsumed,
                    Protein = log.ProteinConsumed,
                    Carbs = log.CarbsConsumed,
                    Fat = log.FatConsumed,
                    LoggedAt = log.LoggedAt,
                    MealType = log.MealType
                });
            }
        }

        var totalCalories = dietLogDtos.Sum(d => d.Calories);
        var totalProtein = dietLogDtos.Sum(d => d.Protein);
        var totalCarbs = dietLogDtos.Sum(d => d.Carbs);
        var totalFat = dietLogDtos.Sum(d => d.Fat);

        return Ok(new
        {
            Date = targetDate,
            DietLogs = dietLogDtos,
            Summary = new
            {
                TotalCalories = totalCalories,
                TotalProtein = totalProtein,
                TotalCarbs = totalCarbs,
                TotalFat = totalFat
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> LogFood([FromBody] CreateDietLogDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var food = await _unitOfWork.Foods.GetByIdAsync(model.FoodId);
        if (food == null || !food.IsActive)
            return BadRequest("Food not found");

        // Calculate nutritional values based on quantity
        var multiplier = model.Quantity / 100.0; // Food values are per 100g
        var calories = food.CaloriesPer100g * multiplier;
        var protein = food.ProteinPer100g * multiplier;
        var carbs = food.CarbsPer100g * multiplier;
        var fat = food.FatPer100g * multiplier;

        var dietLog = new UserDietLog
        {
            UserId = userId,
            FoodId = model.FoodId,
            Quantity = model.Quantity,
            Unit = model.Unit,
            CaloriesConsumed = Math.Round(calories, 2),
            ProteinConsumed = Math.Round(protein, 2),
            CarbsConsumed = Math.Round(carbs, 2),
            FatConsumed = Math.Round(fat, 2),
            LoggedAt = model.LoggedAt ?? DateTime.UtcNow,
            MealType = model.MealType
        };

        await _unitOfWork.UserDietLogs.AddAsync(dietLog);
        await _unitOfWork.SaveChangesAsync();

        var dietLogDto = new DietLogDto
        {
            Id = dietLog.Id,
            FoodId = dietLog.FoodId,
            FoodName = food.Name,
            Quantity = dietLog.Quantity,
            Unit = dietLog.Unit,
            Calories = dietLog.CaloriesConsumed,
            Protein = dietLog.ProteinConsumed,
            Carbs = dietLog.CarbsConsumed,
            Fat = dietLog.FatConsumed,
            LoggedAt = dietLog.LoggedAt,
            MealType = dietLog.MealType
        };

        return CreatedAtAction(nameof(GetDietLog), new { id = dietLog.Id }, dietLogDto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDietLog(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dietLog = await _unitOfWork.UserDietLogs.FindAsync(
            dl => dl.Id == id && dl.UserId == userId);

        var log = dietLog.FirstOrDefault();
        if (log == null)
            return NotFound();

        var food = await _unitOfWork.Foods.GetByIdAsync(log.FoodId);
        if (food == null)
            return NotFound();

        var dietLogDto = new DietLogDto
        {
            Id = log.Id,
            FoodId = log.FoodId,
            FoodName = food.Name,
            Quantity = log.Quantity,
            Unit = log.Unit,
            Calories = log.CaloriesConsumed,
            Protein = log.ProteinConsumed,
            Carbs = log.CarbsConsumed,
            Fat = log.FatConsumed,
            LoggedAt = log.LoggedAt,
            MealType = log.MealType
        };

        return Ok(dietLogDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDietLog(int id, [FromBody] UpdateDietLogDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(
            dl => dl.Id == id && dl.UserId == userId);

        var dietLog = dietLogs.FirstOrDefault();
        if (dietLog == null)
            return NotFound();

        var food = await _unitOfWork.Foods.GetByIdAsync(dietLog.FoodId);
        if (food == null)
            return BadRequest("Food not found");

        // Recalculate nutritional values based on new quantity
        var multiplier = model.Quantity / 100.0;
        dietLog.Quantity = model.Quantity;
        dietLog.Unit = model.Unit;
        dietLog.CaloriesConsumed = Math.Round(food.CaloriesPer100g * multiplier, 2);
        dietLog.ProteinConsumed = Math.Round(food.ProteinPer100g * multiplier, 2);
        dietLog.CarbsConsumed = Math.Round(food.CarbsPer100g * multiplier, 2);
        dietLog.FatConsumed = Math.Round(food.FatPer100g * multiplier, 2);
        dietLog.MealType = model.MealType;

        // Note: Update method doesn't exist in IRepository, we'll save changes instead
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDietLog(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(
            dl => dl.Id == id && dl.UserId == userId);

        var dietLog = dietLogs.FirstOrDefault();
        if (dietLog == null)
            return NotFound();

        await _unitOfWork.UserDietLogs.DeleteAsync(dietLog);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("daily-summary")]
    public async Task<IActionResult> GetDailySummary([FromQuery] DateTime? date = null)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var targetDate = date?.Date ?? DateTime.Today;
        var nextDay = targetDate.AddDays(1);

        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(
            dl => dl.UserId == userId &&
                  dl.LoggedAt >= targetDate &&
                  dl.LoggedAt < nextDay);

        var totalCalories = dietLogs.Sum(d => d.CaloriesConsumed);
        var totalProtein = dietLogs.Sum(d => d.ProteinConsumed);
        var totalCarbs = dietLogs.Sum(d => d.CarbsConsumed);
        var totalFat = dietLogs.Sum(d => d.FatConsumed);

        // Get user's goals
        var userProfiles = await _unitOfWork.UserProfiles.FindAsync(up => up.UserId == userId);
        var userProfile = userProfiles.FirstOrDefault();

        var summary = new
        {
            Date = targetDate,
            Consumed = new
            {
                Calories = Math.Round(totalCalories, 2),
                Protein = Math.Round(totalProtein, 2),
                Carbs = Math.Round(totalCarbs, 2),
                Fat = Math.Round(totalFat, 2)
            },
            Goals = userProfile != null ? new
            {
                Calories = userProfile.DailyCalorieGoal,
                Protein = userProfile.DailyProteinGoal
            } : null,
            Progress = userProfile != null ? new
            {
                CalorieProgress = Math.Round((totalCalories / userProfile.DailyCalorieGoal) * 100, 1),
                ProteinProgress = Math.Round((totalProtein / userProfile.DailyProteinGoal) * 100, 1)
            } : null
        };

        return Ok(summary);
    }
}
