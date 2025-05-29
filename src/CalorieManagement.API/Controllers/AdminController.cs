using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;
using CalorieManagement.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminController(
        IUnitOfWork unitOfWork,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var users = await _userManager.Users
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userDtos = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var userProfiles = await _unitOfWork.UserProfiles.FindAsync(up => up.UserId == user.Id);
            var userProfile = userProfiles.FirstOrDefault();

            userDtos.Add(new
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt,
                Roles = roles,
                HasProfile = userProfile != null,
                Profile = userProfile != null ? new
                {
                    Weight = userProfile.Weight,
                    Height = userProfile.Height,
                    Age = userProfile.Age,
                    FitnessGoal = userProfile.FitnessGoal.ToString(),
                    BMI = userProfile.BMI
                } : null
            });
        }

        var totalUsers = await _userManager.Users.CountAsync();

        return Ok(new
        {
            Users = userDtos,
            TotalCount = totalUsers,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
        });
    }

    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        var userProfiles = await _unitOfWork.UserProfiles.FindAsync(up => up.UserId == userId);
        var userProfile = userProfiles.FirstOrDefault();

        // Get user statistics
        var exerciseLogs = await _unitOfWork.UserExerciseLogs.FindAsync(el => el.UserId == userId);
        var dietLogs = await _unitOfWork.UserDietLogs.FindAsync(dl => dl.UserId == userId);
        var achievements = await _unitOfWork.UserAchievements.FindAsync(ua => ua.UserId == userId);
        var streakRecords = await _unitOfWork.StreakRecords.FindAsync(sr => sr.UserId == userId);

        var userDto = new
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            EmailConfirmed = user.EmailConfirmed,
            CreatedAt = user.CreatedAt,
            Roles = roles,
            Profile = userProfile,
            Statistics = new
            {
                TotalWorkouts = exerciseLogs.Count(),
                TotalDietLogs = dietLogs.Count(),
                TotalAchievements = achievements.Count(),
                CurrentStreak = streakRecords.OrderByDescending(sr => sr.LastActivityDate).FirstOrDefault()?.CurrentStreak ?? 0,
                TotalCaloriesBurned = exerciseLogs.Sum(el => el.CaloriesBurned),
                LastActivity = new[]
                {
                    exerciseLogs.Any() ? exerciseLogs.Max(el => el.LoggedAt) : DateTime.MinValue,
                    dietLogs.Any() ? dietLogs.Max(dl => dl.LoggedAt) : DateTime.MinValue
                }.Max()
            }
        };

        return Ok(userDto);
    }

    [HttpPost("users/{userId}/roles")]
    public async Task<IActionResult> AssignRole(string userId, [FromBody] AssignRoleDto model)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found");

        var roleExists = await _roleManager.RoleExistsAsync(model.RoleName);
        if (!roleExists)
            return BadRequest("Role does not exist");

        var result = await _userManager.AddToRoleAsync(user, model.RoleName);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = $"Role '{model.RoleName}' assigned to user successfully" });
    }

    [HttpDelete("users/{userId}/roles/{roleName}")]
    public async Task<IActionResult> RemoveRole(string userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found");

        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = $"Role '{roleName}' removed from user successfully" });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        var totalUsers = await _userManager.Users.CountAsync();
        var totalExercises = (await _unitOfWork.Exercises.FindAsync(e => e.IsActive)).Count();
        var totalFoods = (await _unitOfWork.Foods.FindAsync(f => f.IsActive)).Count();
        var totalAchievements = (await _unitOfWork.Achievements.FindAsync(a => a.IsActive)).Count();

        // Recent activity
        var recentUsers = await _userManager.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.CreatedAt
            })
            .ToListAsync();

        var exerciseLogs = await _unitOfWork.UserExerciseLogs.GetAllAsync();
        var dietLogs = await _unitOfWork.UserDietLogs.GetAllAsync();

        var today = DateTime.Today;
        var thisWeek = today.AddDays(-7);
        var thisMonth = today.AddDays(-30);

        var stats = new
        {
            TotalUsers = totalUsers,
            TotalExercises = totalExercises,
            TotalFoods = totalFoods,
            TotalAchievements = totalAchievements,
            ActiveUsersToday = exerciseLogs.Union(dietLogs.Cast<object>())
                .Where(log => GetLogDate(log) >= today)
                .Select(log => GetUserId(log))
                .Distinct()
                .Count(),
            ActiveUsersThisWeek = exerciseLogs.Union(dietLogs.Cast<object>())
                .Where(log => GetLogDate(log) >= thisWeek)
                .Select(log => GetUserId(log))
                .Distinct()
                .Count(),
            TotalWorkoutsThisMonth = exerciseLogs.Count(el => el.LoggedAt >= thisMonth),
            TotalDietLogsThisMonth = dietLogs.Count(dl => dl.LoggedAt >= thisMonth),
            RecentUsers = recentUsers
        };

        return Ok(stats);
    }

    [HttpGet("system-health")]
    public async Task<IActionResult> GetSystemHealth()
    {
        try
        {
            // Test database connectivity
            var testQuery = await _unitOfWork.UserProfiles.GetAllAsync();

            var health = new
            {
                Status = "Healthy",
                DatabaseConnection = "Connected",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0"
            };

            return Ok(health);
        }
        catch (Exception ex)
        {
            var health = new
            {
                Status = "Unhealthy",
                DatabaseConnection = "Failed",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0"
            };

            return StatusCode(500, health);
        }
    }

    private DateTime GetLogDate(object log)
    {
        return log switch
        {
            UserExerciseLog exerciseLog => exerciseLog.LoggedAt,
            UserDietLog dietLog => dietLog.LoggedAt,
            _ => DateTime.MinValue
        };
    }

    private string GetUserId(object log)
    {
        return log switch
        {
            UserExerciseLog exerciseLog => exerciseLog.UserId,
            UserDietLog dietLog => dietLog.UserId,
            _ => string.Empty
        };
    }

    // Exercise Management Endpoints
    [HttpGet("exercises")]
    public async Task<IActionResult> GetExercises()
    {
        var exercises = await _unitOfWork.Exercises.GetAllAsync();
        return Ok(exercises);
    }

    [HttpGet("exercises/{id}")]
    public async Task<IActionResult> GetExercise(int id)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id);
        if (exercise == null)
            return NotFound();

        return Ok(exercise);
    }

    [HttpPost("exercises")]
    public async Task<IActionResult> CreateExercise([FromBody] CreateExerciseDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var exercise = new Exercise
        {
            Name = model.Name,
            Description = model.Description,
            Instructions = model.Instructions,
            Type = model.Type,
            Location = model.Location,
            Difficulty = model.Difficulty,
            DurationMinutes = model.DurationMinutes,
            CaloriesBurnedPerMinute = model.CaloriesBurnedPerMinute,
            ImageUrl = model.ImageUrl ?? string.Empty,
            VideoUrl = model.VideoUrl ?? string.Empty,
            MuscleGroups = JsonSerializer.Serialize(model.MuscleGroups ?? new List<string>()),
            Equipment = JsonSerializer.Serialize(model.Equipment ?? new List<string>()),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Exercises.AddAsync(exercise);
        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExercise), new { id = exercise.Id }, exercise);
    }

    [HttpPut("exercises/{id}")]
    public async Task<IActionResult> UpdateExercise(int id, [FromBody] UpdateExerciseDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id);
        if (exercise == null)
            return NotFound();

        // Update only non-null values
        if (!string.IsNullOrEmpty(model.Name))
            exercise.Name = model.Name;
        if (!string.IsNullOrEmpty(model.Description))
            exercise.Description = model.Description;
        if (!string.IsNullOrEmpty(model.Instructions))
            exercise.Instructions = model.Instructions;
        if (model.Type.HasValue)
            exercise.Type = model.Type.Value;
        if (model.Location.HasValue)
            exercise.Location = model.Location.Value;
        if (model.Difficulty.HasValue)
            exercise.Difficulty = model.Difficulty.Value;
        if (model.DurationMinutes.HasValue)
            exercise.DurationMinutes = model.DurationMinutes.Value;
        if (model.CaloriesBurnedPerMinute.HasValue)
            exercise.CaloriesBurnedPerMinute = model.CaloriesBurnedPerMinute.Value;
        if (!string.IsNullOrEmpty(model.VideoUrl))
            exercise.VideoUrl = model.VideoUrl;
        if (model.MuscleGroups != null)
            exercise.MuscleGroups = JsonSerializer.Serialize(model.MuscleGroups);
        if (model.Equipment != null)
            exercise.Equipment = JsonSerializer.Serialize(model.Equipment);

        exercise.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Exercises.UpdateAsync(exercise);
        await _unitOfWork.SaveChangesAsync();

        return Ok(exercise);
    }

    [HttpDelete("exercises/{id}")]
    public async Task<IActionResult> DeleteExercise(int id)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id);
        if (exercise == null)
            return NotFound();

        exercise.IsActive = false;
        exercise.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Exercises.UpdateAsync(exercise);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("exercises/{id}/image")]
    public async Task<IActionResult> UploadExerciseImage(int id, IFormFile image)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id);
        if (exercise == null)
            return NotFound();

        if (image == null || image.Length == 0)
            return BadRequest("No image file provided");

        // Simple file validation
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Invalid file type. Only JPG, PNG, and GIF files are allowed.");

        // Create uploads directory if it doesn't exist
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "exercises");
        Directory.CreateDirectory(uploadsPath);

        // Generate unique filename
        var fileName = $"{id}_{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        // Update exercise with image URL
        exercise.ImageUrl = $"/uploads/exercises/{fileName}";
        exercise.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Exercises.UpdateAsync(exercise);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { ImageUrl = exercise.ImageUrl });
    }

    // Food Management Endpoints
    [HttpGet("foods")]
    public async Task<IActionResult> GetFoods()
    {
        var foods = await _unitOfWork.Foods.GetAllAsync();
        return Ok(foods);
    }

    [HttpGet("foods/{id}")]
    public async Task<IActionResult> GetFood(int id)
    {
        var food = await _unitOfWork.Foods.GetByIdAsync(id);
        if (food == null)
            return NotFound();

        return Ok(food);
    }

    [HttpPost("foods")]
    public async Task<IActionResult> CreateFood([FromBody] CreateFoodDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var food = new Food
        {
            Name = model.Name,
            Description = model.Description,
            Category = model.Category,
            CaloriesPer100g = model.CaloriesPer100g,
            ProteinPer100g = model.ProteinPer100g,
            CarbsPer100g = model.CarbsPer100g,
            FatPer100g = model.FatPer100g,
            FiberPer100g = model.FiberPer100g,
            ImageUrl = model.ImageUrl ?? string.Empty,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Foods.AddAsync(food);
        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFood), new { id = food.Id }, food);
    }

    [HttpPut("foods/{id}")]
    public async Task<IActionResult> UpdateFood(int id, [FromBody] UpdateFoodDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var food = await _unitOfWork.Foods.GetByIdAsync(id);
        if (food == null)
            return NotFound();

        food.Name = model.Name;
        food.Description = model.Description;
        food.Category = model.Category;
        food.CaloriesPer100g = model.CaloriesPer100g;
        food.ProteinPer100g = model.ProteinPer100g;
        food.CarbsPer100g = model.CarbsPer100g;
        food.FatPer100g = model.FatPer100g;
        food.FiberPer100g = model.FiberPer100g;
        food.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Foods.UpdateAsync(food);
        await _unitOfWork.SaveChangesAsync();

        return Ok(food);
    }

    [HttpDelete("foods/{id}")]
    public async Task<IActionResult> DeleteFood(int id)
    {
        var food = await _unitOfWork.Foods.GetByIdAsync(id);
        if (food == null)
            return NotFound();

        food.IsActive = false;
        food.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Foods.UpdateAsync(food);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    // Achievement Management Endpoints
    [HttpGet("achievements")]
    public async Task<IActionResult> GetAchievements()
    {
        var achievements = await _unitOfWork.Achievements.GetAllAsync();
        return Ok(achievements);
    }

    [HttpGet("achievements/{id}")]
    public async Task<IActionResult> GetAchievement(int id)
    {
        var achievement = await _unitOfWork.Achievements.GetByIdAsync(id);
        if (achievement == null)
            return NotFound();

        return Ok(achievement);
    }

    [HttpPost("achievements")]
    public async Task<IActionResult> CreateAchievement([FromBody] CreateAchievementDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var achievement = new Achievement
        {
            Name = model.Name,
            Description = model.Description,
            Type = model.Type,
            RequiredValue = model.RequiredValue,
            Points = model.Points,
            IconUrl = model.IconUrl ?? string.Empty,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Achievements.AddAsync(achievement);
        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAchievement), new { id = achievement.Id }, achievement);
    }

    [HttpPut("achievements/{id}")]
    public async Task<IActionResult> UpdateAchievement(int id, [FromBody] CreateAchievementDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var achievement = await _unitOfWork.Achievements.GetByIdAsync(id);
        if (achievement == null)
            return NotFound();

        achievement.Name = model.Name;
        achievement.Description = model.Description;
        achievement.Type = model.Type;
        achievement.RequiredValue = model.RequiredValue;
        achievement.Points = model.Points;

        await _unitOfWork.Achievements.UpdateAsync(achievement);
        await _unitOfWork.SaveChangesAsync();

        return Ok(achievement);
    }

    [HttpDelete("achievements/{id}")]
    public async Task<IActionResult> DeleteAchievement(int id)
    {
        var achievement = await _unitOfWork.Achievements.GetByIdAsync(id);
        if (achievement == null)
            return NotFound();

        achievement.IsActive = false;
        await _unitOfWork.Achievements.UpdateAsync(achievement);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}

public class AssignRoleDto
{
    public string RoleName { get; set; } = string.Empty;
}
