using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Enums;

namespace CalorieManagement.Core.Interfaces;

public interface ICalorieCalculationService
{
    double CalculateBMI(double weight, double height);
    string GetBMICategory(double bmi);
    double CalculateBasalMetabolicRate(double weight, double height, int age, Gender gender);
    double CalculateTotalDailyEnergyExpenditure(double bmr, ActivityLevel activityLevel);
    double CalculateCalorieGoal(double tdee, FitnessGoal goal, double targetWeight, double currentWeight);
    double CalculateProteinGoal(double weight, FitnessGoal goal, ActivityLevel activityLevel);
    string GetRecommendation(double bmi, FitnessGoal goal);
}
