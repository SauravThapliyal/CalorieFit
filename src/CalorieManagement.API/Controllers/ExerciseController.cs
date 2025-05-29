using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using CalorieManagement.Application.DTOs;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Enums;
using CalorieManagement.Core.Interfaces;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExerciseController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ExerciseController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetExercises(
        [FromQuery] ExerciseType? type = null,
        [FromQuery] ExerciseLocation? location = null,
        [FromQuery] DifficultyLevel? difficulty = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var exercises = await _unitOfWork.Exercises.FindAsync(e => e.IsActive);

        if (type.HasValue)
            exercises = exercises.Where(e => e.Type == type.Value);

        if (location.HasValue)
            exercises = exercises.Where(e => e.Location == location.Value);

        if (difficulty.HasValue)
            exercises = exercises.Where(e => e.Difficulty == difficulty.Value);

        var pagedExercises = exercises.OrderBy(e => e.Name)
                                    .Skip((page - 1) * pageSize)
                                    .Take(pageSize)
                                    .Select(e => new ExerciseDto
                                    {
                                        Id = e.Id,
                                        Name = e.Name,
                                        Description = e.Description,
                                        Instructions = e.Instructions,
                                        Type = e.Type,
                                        Location = e.Location,
                                        Difficulty = e.Difficulty,
                                        DurationMinutes = e.DurationMinutes,
                                        CaloriesBurnedPerMinute = e.CaloriesBurnedPerMinute,
                                        ImageUrl = e.ImageUrl,
                                        VideoUrl = e.VideoUrl,
                                        MuscleGroups = string.IsNullOrEmpty(e.MuscleGroups) ?
                                            new List<string>() :
                                            JsonSerializer.Deserialize<List<string>>(e.MuscleGroups) ?? new List<string>(),
                                        Equipment = string.IsNullOrEmpty(e.Equipment) ?
                                            new List<string>() :
                                            JsonSerializer.Deserialize<List<string>>(e.Equipment) ?? new List<string>(),
                                        IsActive = e.IsActive,
                                        CreatedAt = e.CreatedAt
                                    })
                                    .ToList();

        return Ok(pagedExercises);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExercise(int id)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id);
        if (exercise == null || !exercise.IsActive)
            return NotFound();

        var exerciseDto = new ExerciseDto
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Description = exercise.Description,
            Instructions = exercise.Instructions,
            Type = exercise.Type,
            Location = exercise.Location,
            Difficulty = exercise.Difficulty,
            DurationMinutes = exercise.DurationMinutes,
            CaloriesBurnedPerMinute = exercise.CaloriesBurnedPerMinute,
            ImageUrl = exercise.ImageUrl,
            VideoUrl = exercise.VideoUrl,
            MuscleGroups = string.IsNullOrEmpty(exercise.MuscleGroups) ?
                new List<string>() :
                JsonSerializer.Deserialize<List<string>>(exercise.MuscleGroups) ?? new List<string>(),
            Equipment = string.IsNullOrEmpty(exercise.Equipment) ?
                new List<string>() :
                JsonSerializer.Deserialize<List<string>>(exercise.Equipment) ?? new List<string>(),
            IsActive = exercise.IsActive,
            CreatedAt = exercise.CreatedAt
        };

        return Ok(exerciseDto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
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
            ImageUrl = model.ImageUrl,
            VideoUrl = model.VideoUrl,
            MuscleGroups = JsonSerializer.Serialize(model.MuscleGroups),
            Equipment = JsonSerializer.Serialize(model.Equipment)
        };

        await _unitOfWork.Exercises.AddAsync(exercise);
        await _unitOfWork.SaveChangesAsync();

        var exerciseDto = new ExerciseDto
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Description = exercise.Description,
            Instructions = exercise.Instructions,
            Type = exercise.Type,
            Location = exercise.Location,
            Difficulty = exercise.Difficulty,
            DurationMinutes = exercise.DurationMinutes,
            CaloriesBurnedPerMinute = exercise.CaloriesBurnedPerMinute,
            ImageUrl = exercise.ImageUrl,
            VideoUrl = exercise.VideoUrl,
            MuscleGroups = model.MuscleGroups,
            Equipment = model.Equipment,
            IsActive = exercise.IsActive,
            CreatedAt = exercise.CreatedAt
        };

        return CreatedAtAction(nameof(GetExercise), new { id = exercise.Id }, exerciseDto);
    }

    [HttpGet("logs")]
    [Authorize]
    public async Task<IActionResult> GetUserExerciseLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var logs = await _unitOfWork.UserExerciseLogs.FindAsync(l => l.UserId == userId);
        var exercises = await _unitOfWork.Exercises.GetAllAsync();
        var exerciseDict = exercises.ToDictionary(e => e.Id, e => e.Name);

        var pagedLogs = logs.OrderByDescending(l => l.ExerciseDate)
                           .Skip((page - 1) * pageSize)
                           .Take(pageSize)
                           .Select(l => new UserExerciseLogDto
                           {
                               Id = l.Id,
                               UserId = l.UserId,
                               ExerciseId = l.ExerciseId,
                               ExerciseName = exerciseDict.GetValueOrDefault(l.ExerciseId, "Unknown Exercise"),
                               DurationMinutes = l.DurationMinutes,
                               CaloriesBurned = l.CaloriesBurned,
                               Sets = l.Sets,
                               Reps = l.Reps,
                               Weight = l.Weight,
                               Notes = l.Notes,
                               LoggedAt = l.LoggedAt,
                               ExerciseDate = l.ExerciseDate
                           })
                           .ToList();

        return Ok(pagedLogs);
    }

    [HttpPost("logs")]
    [Authorize]
    public async Task<IActionResult> LogExercise([FromBody] CreateUserExerciseLogDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var exercise = await _unitOfWork.Exercises.GetByIdAsync(model.ExerciseId);
        if (exercise == null)
            return BadRequest("Exercise not found");

        Console.WriteLine($"Backend - Exercise Log Request:");
        Console.WriteLine($"- ExerciseId: {model.ExerciseId}");
        Console.WriteLine($"- DurationMinutes: {model.DurationMinutes}");
        Console.WriteLine($"- CaloriesBurned (from frontend): {model.CaloriesBurned}");
        Console.WriteLine($"- Exercise CaloriesBurnedPerMinute: {exercise.CaloriesBurnedPerMinute}");

        var caloriesBurned = model.CaloriesBurned ??
                           (exercise.CaloriesBurnedPerMinute * model.DurationMinutes);

        Console.WriteLine($"- Final CaloriesBurned: {caloriesBurned}");

        var exerciseLog = new UserExerciseLog
        {
            UserId = userId,
            ExerciseId = model.ExerciseId,
            DurationMinutes = model.DurationMinutes,
            CaloriesBurned = caloriesBurned,
            Sets = model.Sets,
            Reps = model.Reps,
            Weight = model.Weight,
            Notes = model.Notes,
            ExerciseDate = model.ExerciseDate
        };

        await _unitOfWork.UserExerciseLogs.AddAsync(exerciseLog);
        await _unitOfWork.SaveChangesAsync();

        var logDto = new UserExerciseLogDto
        {
            Id = exerciseLog.Id,
            UserId = exerciseLog.UserId,
            ExerciseId = exerciseLog.ExerciseId,
            ExerciseName = exercise.Name,
            DurationMinutes = exerciseLog.DurationMinutes,
            CaloriesBurned = exerciseLog.CaloriesBurned,
            Sets = exerciseLog.Sets,
            Reps = exerciseLog.Reps,
            Weight = exerciseLog.Weight,
            Notes = exerciseLog.Notes,
            LoggedAt = exerciseLog.LoggedAt,
            ExerciseDate = exerciseLog.ExerciseDate
        };

        return CreatedAtAction(nameof(GetUserExerciseLogs), logDto);
    }
}
