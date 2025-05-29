namespace CalorieManagement.Core.Enums;

public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3
}

public enum ActivityLevel
{
    Sedentary = 1,      // Little to no exercise
    LightlyActive = 2,  // Light exercise 1-3 days/week
    ModeratelyActive = 3, // Moderate exercise 3-5 days/week
    VeryActive = 4,     // Hard exercise 6-7 days/week
    ExtraActive = 5     // Very hard exercise, physical job
}

public enum FitnessGoal
{
    WeightLoss = 1,
    WeightGain = 2,
    MaintainWeight = 3,
    CustomPlan = 4
}

public enum ExerciseType
{
    Cardio = 1,
    Strength = 2,
    Flexibility = 3,
    HIIT = 4,
    Sports = 5,
    Other = 6
}

public enum ExerciseLocation
{
    Home = 1,
    Gym = 2,
    Outdoor = 3,
    Both = 4,
    Online = 5
}

public enum DifficultyLevel
{
    Beginner = 1,
    Intermediate = 2,
    Advanced = 3
}

public enum AchievementType
{
    WeightLoss = 1,
    WeightGain = 2,
    DailyStreak = 3,
    TotalWorkouts = 4,
    CaloriesBurned = 5,
    ConsistentLogging = 6,
    CalorieGoal = 7,
    ProteinGoal = 8
}

public enum StreakType
{
    Exercise = 1,
    Diet = 2,
    CalorieGoal = 3,
    WeightTracking = 4
}
