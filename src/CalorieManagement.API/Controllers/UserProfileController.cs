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
public class UserProfileController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICalorieCalculationService _calorieService;

    public UserProfileController(IUnitOfWork unitOfWork, ICalorieCalculationService calorieService)
    {
        _unitOfWork = unitOfWork;
        _calorieService = calorieService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await _unitOfWork.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
            return NotFound("User profile not found");

        var recommendation = _calorieService.GetRecommendation(profile.BMI, profile.FitnessGoal);

        var profileDto = new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            Weight = profile.Weight,
            Height = profile.Height,
            Age = profile.Age,
            Gender = profile.Gender,
            ActivityLevel = profile.ActivityLevel,
            FitnessGoal = profile.FitnessGoal,
            TargetWeight = profile.TargetWeight,
            BMI = profile.BMI,
            BMICategory = profile.BMICategory,
            DailyCalorieGoal = profile.DailyCalorieGoal,
            DailyProteinGoal = profile.DailyProteinGoal,
            Recommendation = recommendation,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };

        return Ok(profileDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProfile([FromBody] CreateUserProfileDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Check if profile already exists
        var existingProfile = await _unitOfWork.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (existingProfile != null)
            return BadRequest("User profile already exists");

        // Calculate BMI and other metrics
        var bmi = _calorieService.CalculateBMI(model.Weight, model.Height);
        var bmiCategory = _calorieService.GetBMICategory(bmi);
        var bmr = _calorieService.CalculateBasalMetabolicRate(model.Weight, model.Height, model.Age, model.Gender);
        var tdee = _calorieService.CalculateTotalDailyEnergyExpenditure(bmr, model.ActivityLevel);
        var calorieGoal = _calorieService.CalculateCalorieGoal(tdee, model.FitnessGoal, model.TargetWeight, model.Weight);
        var proteinGoal = _calorieService.CalculateProteinGoal(model.Weight, model.FitnessGoal, model.ActivityLevel);

        var profile = new UserProfile
        {
            UserId = userId,
            Weight = model.Weight,
            Height = model.Height,
            Age = model.Age,
            Gender = model.Gender,
            ActivityLevel = model.ActivityLevel,
            FitnessGoal = model.FitnessGoal,
            TargetWeight = model.TargetWeight,
            BMI = bmi,
            BMICategory = bmiCategory,
            DailyCalorieGoal = calorieGoal,
            DailyProteinGoal = proteinGoal
        };

        await _unitOfWork.UserProfiles.AddAsync(profile);
        await _unitOfWork.SaveChangesAsync();

        var recommendation = _calorieService.GetRecommendation(bmi, model.FitnessGoal);

        var profileDto = new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            Weight = profile.Weight,
            Height = profile.Height,
            Age = profile.Age,
            Gender = profile.Gender,
            ActivityLevel = profile.ActivityLevel,
            FitnessGoal = profile.FitnessGoal,
            TargetWeight = profile.TargetWeight,
            BMI = profile.BMI,
            BMICategory = profile.BMICategory,
            DailyCalorieGoal = profile.DailyCalorieGoal,
            DailyProteinGoal = profile.DailyProteinGoal,
            Recommendation = recommendation,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };

        return CreatedAtAction(nameof(GetProfile), profileDto);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await _unitOfWork.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
            return NotFound("User profile not found");

        // Update only provided fields
        if (model.Weight.HasValue) profile.Weight = model.Weight.Value;
        if (model.Height.HasValue) profile.Height = model.Height.Value;
        if (model.Age.HasValue) profile.Age = model.Age.Value;
        if (model.Gender.HasValue) profile.Gender = model.Gender.Value;
        if (model.ActivityLevel.HasValue) profile.ActivityLevel = model.ActivityLevel.Value;
        if (model.FitnessGoal.HasValue) profile.FitnessGoal = model.FitnessGoal.Value;
        if (model.TargetWeight.HasValue) profile.TargetWeight = model.TargetWeight.Value;

        // Recalculate metrics
        var bmi = _calorieService.CalculateBMI(profile.Weight, profile.Height);
        var bmiCategory = _calorieService.GetBMICategory(bmi);
        var bmr = _calorieService.CalculateBasalMetabolicRate(profile.Weight, profile.Height, profile.Age, profile.Gender);
        var tdee = _calorieService.CalculateTotalDailyEnergyExpenditure(bmr, profile.ActivityLevel);
        var calorieGoal = _calorieService.CalculateCalorieGoal(tdee, profile.FitnessGoal, profile.TargetWeight, profile.Weight);
        var proteinGoal = _calorieService.CalculateProteinGoal(profile.Weight, profile.FitnessGoal, profile.ActivityLevel);

        profile.BMI = bmi;
        profile.BMICategory = bmiCategory;
        profile.DailyCalorieGoal = calorieGoal;
        profile.DailyProteinGoal = proteinGoal;
        profile.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserProfiles.UpdateAsync(profile);
        await _unitOfWork.SaveChangesAsync();

        var recommendation = _calorieService.GetRecommendation(bmi, profile.FitnessGoal);

        var profileDto = new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            Weight = profile.Weight,
            Height = profile.Height,
            Age = profile.Age,
            Gender = profile.Gender,
            ActivityLevel = profile.ActivityLevel,
            FitnessGoal = profile.FitnessGoal,
            TargetWeight = profile.TargetWeight,
            BMI = profile.BMI,
            BMICategory = profile.BMICategory,
            DailyCalorieGoal = profile.DailyCalorieGoal,
            DailyProteinGoal = profile.DailyProteinGoal,
            Recommendation = recommendation,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };

        return Ok(profileDto);
    }
}
