using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Enums;
using CalorieManagement.Core.Interfaces;

namespace CalorieManagement.Application.Services;

public class CalorieCalculationService : ICalorieCalculationService
{
    public double CalculateBMI(double weight, double height)
    {
        if (height <= 0) throw new ArgumentException("Height must be greater than 0");
        return Math.Round(weight / (height * height), 2);
    }

    public string GetBMICategory(double bmi)
    {
        return bmi switch
        {
            < 18.5 => "Underweight",
            >= 18.5 and < 25 => "Normal weight",
            >= 25 and < 30 => "Overweight",
            >= 30 => "Obese",
            _ => "Invalid BMI"
        };
    }

    public double CalculateBasalMetabolicRate(double weight, double height, int age, Gender gender)
    {
        // Mifflin-St Jeor Equation
        double bmr = (10 * weight) + (6.25 * height * 100) - (5 * age);

        return gender == Gender.Male ? bmr + 5 : bmr - 161;
    }

    public double CalculateTotalDailyEnergyExpenditure(double bmr, ActivityLevel activityLevel)
    {
        double multiplier = activityLevel switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.LightlyActive => 1.375,
            ActivityLevel.ModeratelyActive => 1.55,
            ActivityLevel.VeryActive => 1.725,
            ActivityLevel.ExtraActive => 1.9,
            _ => 1.2
        };

        return Math.Round(bmr * multiplier, 0);
    }

    public double CalculateCalorieGoal(double tdee, FitnessGoal goal, double targetWeight, double currentWeight)
    {
        return goal switch
        {
            FitnessGoal.WeightLoss => Math.Round(tdee - 500, 0), // 500 calorie deficit for 1 lb/week loss
            FitnessGoal.WeightGain => Math.Round(tdee + 500, 0), // 500 calorie surplus for 1 lb/week gain
            FitnessGoal.MaintainWeight => Math.Round(tdee, 0),
            FitnessGoal.CustomPlan => Math.Round(tdee, 0), // User can customize later
            _ => Math.Round(tdee, 0)
        };
    }

    public double CalculateProteinGoal(double weight, FitnessGoal goal, ActivityLevel activityLevel)
    {
        double proteinPerKg = goal switch
        {
            FitnessGoal.WeightLoss => 1.6, // Higher protein to preserve muscle during weight loss
            FitnessGoal.WeightGain => 1.8, // Higher protein for muscle building
            FitnessGoal.MaintainWeight => 1.2,
            FitnessGoal.CustomPlan => 1.4,
            _ => 1.2
        };

        // Adjust for activity level
        if (activityLevel >= ActivityLevel.VeryActive)
            proteinPerKg += 0.2;

        return Math.Round(weight * proteinPerKg, 1);
    }

    public string GetRecommendation(double bmi, FitnessGoal goal)
    {
        var bmiCategory = GetBMICategory(bmi);

        return (bmiCategory, goal) switch
        {
            ("Underweight", FitnessGoal.WeightLoss) => "Your BMI indicates you're underweight. Consider focusing on healthy weight gain instead.",
            ("Underweight", _) => "Great choice! Focus on gaining weight through a balanced diet and strength training.",
            ("Normal weight", FitnessGoal.MaintainWeight) => "Perfect! Maintain your healthy weight with balanced nutrition and regular exercise.",
            ("Normal weight", _) => "You're in a healthy weight range. Make sure your goals align with your overall health objectives.",
            ("Overweight", FitnessGoal.WeightLoss) => "Good choice! A moderate calorie deficit with regular exercise will help you reach a healthier weight.",
            ("Overweight", FitnessGoal.WeightGain) => "Consider focusing on weight loss first to reach a healthier BMI range.",
            ("Obese", FitnessGoal.WeightLoss) => "Excellent decision! Weight loss will significantly improve your health. Consider consulting with a healthcare provider.",
            ("Obese", FitnessGoal.WeightGain) => "We strongly recommend focusing on weight loss for your health. Please consult with a healthcare provider.",
            _ => "Focus on maintaining a balanced diet and regular exercise routine."
        };
    }
}
