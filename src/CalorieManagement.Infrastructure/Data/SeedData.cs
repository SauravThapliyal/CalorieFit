using System.Text.Json;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Enums;

namespace CalorieManagement.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context.Exercises.Any())
            return; // Data already seeded

        var exercises = new List<Exercise>
        {
            new Exercise
            {
                Name = "Push-ups",
                Description = "A classic bodyweight exercise that targets chest, shoulders, and triceps.",
                Instructions = "Start in a plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches the floor, then push back up.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Home,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 10,
                CaloriesBurnedPerMinute = 7.0,
                ImageUrl = "/images/exercises/pushups.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Chest", "Shoulders", "Triceps", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "None" })
            },
            new Exercise
            {
                Name = "Squats",
                Description = "A fundamental lower body exercise that targets quadriceps, glutes, and hamstrings.",
                Instructions = "Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair, keeping chest up and knees behind toes. Return to standing.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Home,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 10,
                CaloriesBurnedPerMinute = 8.0,
                ImageUrl = "/images/exercises/squats.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Quadriceps", "Glutes", "Hamstrings", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "None" })
            },
            new Exercise
            {
                Name = "Running",
                Description = "Cardiovascular exercise that improves heart health and burns calories.",
                Instructions = "Maintain a steady pace, land on the balls of your feet, keep arms relaxed, and breathe rhythmically.",
                Type = ExerciseType.Cardio,
                Location = ExerciseLocation.Outdoor,
                Difficulty = DifficultyLevel.Intermediate,
                DurationMinutes = 30,
                CaloriesBurnedPerMinute = 12.0,
                ImageUrl = "/images/exercises/running.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Legs", "Core", "Cardiovascular System" }),
                Equipment = JsonSerializer.Serialize(new[] { "Running Shoes" })
            },
            new Exercise
            {
                Name = "Deadlifts",
                Description = "A compound exercise that works multiple muscle groups, primarily the posterior chain.",
                Instructions = "Stand with feet hip-width apart, grip the bar with hands just outside legs. Keep back straight, lift by driving through heels and extending hips.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Gym,
                Difficulty = DifficultyLevel.Advanced,
                DurationMinutes = 20,
                CaloriesBurnedPerMinute = 10.0,
                ImageUrl = "/images/exercises/deadlifts.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Hamstrings", "Glutes", "Lower Back", "Traps", "Forearms" }),
                Equipment = JsonSerializer.Serialize(new[] { "Barbell", "Weight Plates" })
            },
            new Exercise
            {
                Name = "Yoga Flow",
                Description = "A sequence of yoga poses that improves flexibility, balance, and mindfulness.",
                Instructions = "Flow through poses with controlled breathing. Hold each pose for 30 seconds to 1 minute.",
                Type = ExerciseType.Flexibility,
                Location = ExerciseLocation.Home,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 45,
                CaloriesBurnedPerMinute = 3.0,
                ImageUrl = "/images/exercises/yoga.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Full Body", "Core", "Flexibility" }),
                Equipment = JsonSerializer.Serialize(new[] { "Yoga Mat" })
            },
            new Exercise
            {
                Name = "Bench Press",
                Description = "A fundamental upper body strength exercise targeting the chest muscles.",
                Instructions = "Lie on bench, grip bar slightly wider than shoulders. Lower bar to chest, then press up until arms are fully extended.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Gym,
                Difficulty = DifficultyLevel.Intermediate,
                DurationMinutes = 15,
                CaloriesBurnedPerMinute = 6.0,
                ImageUrl = "/images/exercises/benchpress.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Chest", "Shoulders", "Triceps" }),
                Equipment = JsonSerializer.Serialize(new[] { "Barbell", "Bench", "Weight Plates" })
            },
            new Exercise
            {
                Name = "Cycling",
                Description = "Low-impact cardiovascular exercise that strengthens legs and improves endurance.",
                Instructions = "Maintain proper posture, adjust seat height, pedal at a steady rhythm, and vary intensity.",
                Type = ExerciseType.Cardio,
                Location = ExerciseLocation.Outdoor,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 45,
                CaloriesBurnedPerMinute = 9.0,
                ImageUrl = "/images/exercises/cycling.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Quadriceps", "Hamstrings", "Calves", "Glutes" }),
                Equipment = JsonSerializer.Serialize(new[] { "Bicycle", "Helmet" })
            },
            new Exercise
            {
                Name = "Plank",
                Description = "An isometric core exercise that builds stability and strength.",
                Instructions = "Hold a push-up position with forearms on the ground. Keep body straight from head to heels.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Home,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 5,
                CaloriesBurnedPerMinute = 5.0,
                ImageUrl = "/images/exercises/plank.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Core", "Shoulders", "Back" }),
                Equipment = JsonSerializer.Serialize(new[] { "None" })
            }
        };

        var foods = new List<Food>
        {
            new Food
            {
                Name = "Chicken Breast",
                Description = "Lean protein source, skinless and boneless",
                CaloriesPer100g = 165,
                ProteinPer100g = 31,
                CarbsPer100g = 0,
                FatPer100g = 3.6,
                FiberPer100g = 0,
                Category = "Proteins",
                ImageUrl = "/images/foods/chicken-breast.jpg"
            },
            new Food
            {
                Name = "Brown Rice",
                Description = "Whole grain rice, cooked",
                CaloriesPer100g = 123,
                ProteinPer100g = 2.6,
                CarbsPer100g = 23,
                FatPer100g = 0.9,
                FiberPer100g = 1.8,
                Category = "Grains",
                ImageUrl = "/images/foods/brown-rice.jpg"
            },
            new Food
            {
                Name = "Broccoli",
                Description = "Fresh broccoli, raw",
                CaloriesPer100g = 34,
                ProteinPer100g = 2.8,
                CarbsPer100g = 7,
                FatPer100g = 0.4,
                FiberPer100g = 2.6,
                Category = "Vegetables",
                ImageUrl = "/images/foods/broccoli.jpg"
            },
            new Food
            {
                Name = "Banana",
                Description = "Fresh banana, medium size",
                CaloriesPer100g = 89,
                ProteinPer100g = 1.1,
                CarbsPer100g = 23,
                FatPer100g = 0.3,
                FiberPer100g = 2.6,
                Category = "Fruits",
                ImageUrl = "/images/foods/banana.jpg"
            },
            new Food
            {
                Name = "Almonds",
                Description = "Raw almonds, unsalted",
                CaloriesPer100g = 579,
                ProteinPer100g = 21,
                CarbsPer100g = 22,
                FatPer100g = 50,
                FiberPer100g = 12,
                Category = "Nuts",
                ImageUrl = "/images/foods/almonds.jpg"
            },
            new Food
            {
                Name = "Greek Yogurt",
                Description = "Plain Greek yogurt, non-fat",
                CaloriesPer100g = 59,
                ProteinPer100g = 10,
                CarbsPer100g = 3.6,
                FatPer100g = 0.4,
                FiberPer100g = 0,
                Category = "Dairy",
                ImageUrl = "/images/foods/greek-yogurt.jpg"
            },
            new Food
            {
                Name = "Salmon",
                Description = "Atlantic salmon, cooked",
                CaloriesPer100g = 206,
                ProteinPer100g = 22,
                CarbsPer100g = 0,
                FatPer100g = 12,
                FiberPer100g = 0,
                Category = "Proteins",
                ImageUrl = "/images/foods/salmon.jpg"
            },
            new Food
            {
                Name = "Sweet Potato",
                Description = "Baked sweet potato with skin",
                CaloriesPer100g = 90,
                ProteinPer100g = 2,
                CarbsPer100g = 21,
                FatPer100g = 0.1,
                FiberPer100g = 3.3,
                Category = "Vegetables",
                ImageUrl = "/images/foods/sweet-potato.jpg"
            }
        };

        var achievements = new List<Achievement>
        {
            new Achievement
            {
                Name = "First Workout",
                Description = "Complete your first workout",
                Type = AchievementType.TotalWorkouts,
                IconUrl = "/images/achievements/first-workout.png",
                RequiredValue = 1,
                Points = 10
            },
            new Achievement
            {
                Name = "Week Warrior",
                Description = "Exercise for 7 consecutive days",
                Type = AchievementType.DailyStreak,
                IconUrl = "/images/achievements/week-warrior.png",
                RequiredValue = 7,
                Points = 50
            },
            new Achievement
            {
                Name = "Calorie Crusher",
                Description = "Meet your daily calorie goal for 5 days",
                Type = AchievementType.CalorieGoal,
                IconUrl = "/images/achievements/calorie-crusher.png",
                RequiredValue = 5,
                Points = 30
            },
            new Achievement
            {
                Name = "Weight Loss Champion",
                Description = "Lose 5kg from your starting weight",
                Type = AchievementType.WeightLoss,
                IconUrl = "/images/achievements/weight-loss.png",
                RequiredValue = 5,
                Points = 100
            },
            new Achievement
            {
                Name = "Protein Power",
                Description = "Meet your daily protein goal for 10 days",
                Type = AchievementType.ProteinGoal,
                IconUrl = "/images/achievements/protein-power.png",
                RequiredValue = 10,
                Points = 40
            }
        };

        await context.Exercises.AddRangeAsync(exercises);
        await context.Foods.AddRangeAsync(foods);
        await context.Achievements.AddRangeAsync(achievements);
        await context.SaveChangesAsync();
    }
}
