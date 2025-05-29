using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CalorieManagement.Infrastructure.Data;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public DataSeeder(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task SeedAsync()
    {
        // Ensure database is created
        await _context.Database.EnsureCreatedAsync();

        // Seed roles
        await SeedRolesAsync();

        // Seed admin user
        await SeedAdminUserAsync();

        // Seed exercises
        await SeedExercisesAsync();

        // Seed foods
        await SeedFoodsAsync();

        // Seed achievements
        await SeedAchievementsAsync();

        await _context.SaveChangesAsync();
    }

    private async Task SeedRolesAsync()
    {
        var roles = new[] { "Admin", "User" };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        var adminEmail = "admin@caloriefit.com";
        var adminUser = await _userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }

    private async Task SeedExercisesAsync()
    {
        if (await _context.Exercises.AnyAsync())
            return;

        var exercises = new List<Exercise>
        {
            // Cardio exercises
            new Exercise
            {
                Name = "Running",
                Description = "Outdoor or treadmill running for cardiovascular fitness",
                Instructions = "Start with a warm-up walk, gradually increase pace to a comfortable running speed. Maintain good posture and breathing rhythm.",
                Type = ExerciseType.Cardio,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 30,
                CaloriesBurnedPerMinute = 10.0,
                ImageUrl = "/images/exercises/running.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Legs", "Core", "Cardiovascular" }),
                Equipment = JsonSerializer.Serialize(new[] { "Running shoes", "Optional: Treadmill" })
            },
            new Exercise
            {
                Name = "Cycling",
                Description = "Indoor or outdoor cycling for endurance and leg strength",
                Instructions = "Adjust seat height properly, maintain steady pedaling rhythm, keep core engaged.",
                Type = ExerciseType.Cardio,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 45,
                CaloriesBurnedPerMinute = 8.0,
                ImageUrl = "/images/exercises/cycling.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Legs", "Glutes", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "Bicycle", "Helmet", "Optional: Stationary bike" })
            },
            new Exercise
            {
                Name = "Jump Rope",
                Description = "High-intensity cardio exercise using a jump rope",
                Instructions = "Keep elbows close to body, use wrists to turn rope, land softly on balls of feet.",
                Type = ExerciseType.Cardio,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Intermediate,
                DurationMinutes = 15,
                CaloriesBurnedPerMinute = 12.0,
                ImageUrl = "/images/exercises/jump-rope.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Legs", "Arms", "Core", "Cardiovascular" }),
                Equipment = JsonSerializer.Serialize(new[] { "Jump rope" })
            },

            // Strength exercises
            new Exercise
            {
                Name = "Push-ups",
                Description = "Classic bodyweight exercise for upper body strength",
                Instructions = "Start in plank position, lower body until chest nearly touches floor, push back up. Keep body straight throughout.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 10,
                CaloriesBurnedPerMinute = 6.0,
                ImageUrl = "/images/exercises/pushups.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Chest", "Arms", "Shoulders", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "None" })
            },
            new Exercise
            {
                Name = "Squats",
                Description = "Fundamental lower body exercise for leg and glute strength",
                Instructions = "Stand with feet shoulder-width apart, lower hips back and down, keep chest up, return to standing.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 10,
                CaloriesBurnedPerMinute = 5.0,
                ImageUrl = "/images/exercises/squats.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Legs", "Glutes", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "None", "Optional: Dumbbells" })
            },
            new Exercise
            {
                Name = "Deadlifts",
                Description = "Compound exercise targeting multiple muscle groups",
                Instructions = "Stand with feet hip-width apart, grip barbell, keep back straight, lift by extending hips and knees.",
                Type = ExerciseType.Strength,
                Location = ExerciseLocation.Gym,
                Difficulty = DifficultyLevel.Advanced,
                DurationMinutes = 20,
                CaloriesBurnedPerMinute = 7.0,
                ImageUrl = "/images/exercises/deadlifts.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Back", "Legs", "Glutes", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "Barbell", "Weight plates" })
            },

            // Flexibility exercises
            new Exercise
            {
                Name = "Yoga Flow",
                Description = "Gentle yoga sequence for flexibility and relaxation",
                Instructions = "Move slowly through poses, focus on breathing, hold each pose for 30 seconds.",
                Type = ExerciseType.Flexibility,
                Location = ExerciseLocation.Home,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 30,
                CaloriesBurnedPerMinute = 3.0,
                ImageUrl = "/images/exercises/yoga.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Full body", "Core" }),
                Equipment = JsonSerializer.Serialize(new[] { "Yoga mat" })
            },
            new Exercise
            {
                Name = "Stretching Routine",
                Description = "Full body stretching for improved flexibility",
                Instructions = "Hold each stretch for 15-30 seconds, breathe deeply, don't bounce.",
                Type = ExerciseType.Flexibility,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Beginner,
                DurationMinutes = 15,
                CaloriesBurnedPerMinute = 2.0,
                ImageUrl = "/images/exercises/stretching.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Full body" }),
                Equipment = JsonSerializer.Serialize(new[] { "None", "Optional: Yoga mat" })
            },

            // HIIT exercises
            new Exercise
            {
                Name = "Burpees",
                Description = "High-intensity full-body exercise",
                Instructions = "Start standing, drop to squat, jump back to plank, do push-up, jump feet to squat, jump up with arms overhead.",
                Type = ExerciseType.HIIT,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Advanced,
                DurationMinutes = 10,
                CaloriesBurnedPerMinute = 15.0,
                ImageUrl = "/images/exercises/burpees.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Full body", "Cardiovascular" }),
                Equipment = JsonSerializer.Serialize(new[] { "None" })
            },
            new Exercise
            {
                Name = "Mountain Climbers",
                Description = "Dynamic core and cardio exercise",
                Instructions = "Start in plank position, alternate bringing knees to chest rapidly while maintaining plank form.",
                Type = ExerciseType.HIIT,
                Location = ExerciseLocation.Both,
                Difficulty = DifficultyLevel.Intermediate,
                DurationMinutes = 10,
                CaloriesBurnedPerMinute = 12.0,
                ImageUrl = "/images/exercises/mountain-climbers.jpg",
                VideoUrl = "",
                MuscleGroups = JsonSerializer.Serialize(new[] { "Core", "Arms", "Legs", "Cardiovascular" }),
                Equipment = JsonSerializer.Serialize(new[] { "None" })
            }
        };

        await _context.Exercises.AddRangeAsync(exercises);
    }

    private async Task SeedFoodsAsync()
    {
        if (await _context.Foods.AnyAsync())
            return;

        var foods = new List<Food>
        {
            // Proteins
            new Food { Name = "Chicken Breast", Description = "Lean protein source", CaloriesPer100g = 165, ProteinPer100g = 31, CarbsPer100g = 0, FatPer100g = 3.6, FiberPer100g = 0, Category = "Protein", ImageUrl = "/images/foods/chicken-breast.jpg" },
            new Food { Name = "Salmon", Description = "Fatty fish rich in omega-3", CaloriesPer100g = 208, ProteinPer100g = 25, CarbsPer100g = 0, FatPer100g = 12, FiberPer100g = 0, Category = "Protein", ImageUrl = "/images/foods/salmon.jpg" },
            new Food { Name = "Eggs", Description = "Complete protein source", CaloriesPer100g = 155, ProteinPer100g = 13, CarbsPer100g = 1.1, FatPer100g = 11, FiberPer100g = 0, Category = "Protein", ImageUrl = "/images/foods/eggs.jpg" },
            new Food { Name = "Greek Yogurt", Description = "High protein dairy", CaloriesPer100g = 100, ProteinPer100g = 10, CarbsPer100g = 6, FatPer100g = 5, FiberPer100g = 0, Category = "Protein", ImageUrl = "/images/foods/greek-yogurt.jpg" },

            // Carbohydrates
            new Food { Name = "Brown Rice", Description = "Whole grain carbohydrate", CaloriesPer100g = 123, ProteinPer100g = 2.6, CarbsPer100g = 23, FatPer100g = 0.9, FiberPer100g = 1.8, Category = "Carbohydrates", ImageUrl = "/images/foods/brown-rice.jpg" },
            new Food { Name = "Oats", Description = "Fiber-rich breakfast grain", CaloriesPer100g = 389, ProteinPer100g = 16.9, CarbsPer100g = 66.3, FatPer100g = 6.9, FiberPer100g = 10.6, Category = "Carbohydrates", ImageUrl = "/images/foods/oats.jpg" },
            new Food { Name = "Sweet Potato", Description = "Nutrient-dense root vegetable", CaloriesPer100g = 86, ProteinPer100g = 1.6, CarbsPer100g = 20.1, FatPer100g = 0.1, FiberPer100g = 3, Category = "Carbohydrates", ImageUrl = "/images/foods/sweet-potato.jpg" },
            new Food { Name = "Quinoa", Description = "Complete protein grain", CaloriesPer100g = 120, ProteinPer100g = 4.4, CarbsPer100g = 22, FatPer100g = 1.9, FiberPer100g = 2.8, Category = "Carbohydrates", ImageUrl = "/images/foods/quinoa.jpg" },

            // Vegetables
            new Food { Name = "Broccoli", Description = "Nutrient-dense green vegetable", CaloriesPer100g = 34, ProteinPer100g = 2.8, CarbsPer100g = 7, FatPer100g = 0.4, FiberPer100g = 2.6, Category = "Vegetables", ImageUrl = "/images/foods/broccoli.jpg" },
            new Food { Name = "Spinach", Description = "Iron-rich leafy green", CaloriesPer100g = 23, ProteinPer100g = 2.9, CarbsPer100g = 3.6, FatPer100g = 0.4, FiberPer100g = 2.2, Category = "Vegetables", ImageUrl = "/images/foods/spinach.jpg" },
            new Food { Name = "Bell Peppers", Description = "Vitamin C rich vegetable", CaloriesPer100g = 31, ProteinPer100g = 1, CarbsPer100g = 7, FatPer100g = 0.3, FiberPer100g = 2.5, Category = "Vegetables", ImageUrl = "/images/foods/bell-peppers.jpg" },
            new Food { Name = "Carrots", Description = "Beta-carotene rich root vegetable", CaloriesPer100g = 41, ProteinPer100g = 0.9, CarbsPer100g = 9.6, FatPer100g = 0.2, FiberPer100g = 2.8, Category = "Vegetables", ImageUrl = "/images/foods/carrots.jpg" },

            // Fruits
            new Food { Name = "Apple", Description = "Fiber-rich fruit", CaloriesPer100g = 52, ProteinPer100g = 0.3, CarbsPer100g = 14, FatPer100g = 0.2, FiberPer100g = 2.4, Category = "Fruits", ImageUrl = "/images/foods/apple.jpg" },
            new Food { Name = "Banana", Description = "Potassium-rich fruit", CaloriesPer100g = 89, ProteinPer100g = 1.1, CarbsPer100g = 23, FatPer100g = 0.3, FiberPer100g = 2.6, Category = "Fruits", ImageUrl = "/images/foods/banana.jpg" },
            new Food { Name = "Blueberries", Description = "Antioxidant-rich berries", CaloriesPer100g = 57, ProteinPer100g = 0.7, CarbsPer100g = 14, FatPer100g = 0.3, FiberPer100g = 2.4, Category = "Fruits", ImageUrl = "/images/foods/blueberries.jpg" },
            new Food { Name = "Orange", Description = "Vitamin C rich citrus", CaloriesPer100g = 47, ProteinPer100g = 0.9, CarbsPer100g = 12, FatPer100g = 0.1, FiberPer100g = 2.4, Category = "Fruits", ImageUrl = "/images/foods/orange.jpg" },

            // Healthy Fats
            new Food { Name = "Avocado", Description = "Healthy monounsaturated fats", CaloriesPer100g = 160, ProteinPer100g = 2, CarbsPer100g = 9, FatPer100g = 15, FiberPer100g = 7, Category = "Healthy Fats", ImageUrl = "/images/foods/avocado.jpg" },
            new Food { Name = "Almonds", Description = "Protein and healthy fat rich nuts", CaloriesPer100g = 579, ProteinPer100g = 21, CarbsPer100g = 22, FatPer100g = 50, FiberPer100g = 12, Category = "Healthy Fats", ImageUrl = "/images/foods/almonds.jpg" },
            new Food { Name = "Olive Oil", Description = "Healthy cooking oil", CaloriesPer100g = 884, ProteinPer100g = 0, CarbsPer100g = 0, FatPer100g = 100, FiberPer100g = 0, Category = "Healthy Fats", ImageUrl = "/images/foods/olive-oil.jpg" },
            new Food { Name = "Walnuts", Description = "Omega-3 rich nuts", CaloriesPer100g = 654, ProteinPer100g = 15, CarbsPer100g = 14, FatPer100g = 65, FiberPer100g = 7, Category = "Healthy Fats", ImageUrl = "/images/foods/walnuts.jpg" }
        };

        await _context.Foods.AddRangeAsync(foods);
    }

    private async Task SeedAchievementsAsync()
    {
        if (await _context.Achievements.AnyAsync())
            return;

        var achievements = new List<Achievement>
        {
            new Achievement { Name = "First Steps", Description = "Complete your first workout", Type = AchievementType.TotalWorkouts, RequiredValue = 1, Points = 10, IconUrl = "/images/achievements/first-steps.png" },
            new Achievement { Name = "Getting Started", Description = "Complete 5 workouts", Type = AchievementType.TotalWorkouts, RequiredValue = 5, Points = 25, IconUrl = "/images/achievements/getting-started.png" },
            new Achievement { Name = "Dedicated", Description = "Complete 25 workouts", Type = AchievementType.TotalWorkouts, RequiredValue = 25, Points = 100, IconUrl = "/images/achievements/dedicated.png" },
            new Achievement { Name = "Fitness Enthusiast", Description = "Complete 50 workouts", Type = AchievementType.TotalWorkouts, RequiredValue = 50, Points = 200, IconUrl = "/images/achievements/enthusiast.png" },
            new Achievement { Name = "Fitness Master", Description = "Complete 100 workouts", Type = AchievementType.TotalWorkouts, RequiredValue = 100, Points = 500, IconUrl = "/images/achievements/master.png" },

            new Achievement { Name = "Streak Starter", Description = "Maintain a 3-day streak", Type = AchievementType.DailyStreak, RequiredValue = 3, Points = 15, IconUrl = "/images/achievements/streak-starter.png" },
            new Achievement { Name = "Week Warrior", Description = "Maintain a 7-day streak", Type = AchievementType.DailyStreak, RequiredValue = 7, Points = 50, IconUrl = "/images/achievements/week-warrior.png" },
            new Achievement { Name = "Consistency King", Description = "Maintain a 30-day streak", Type = AchievementType.DailyStreak, RequiredValue = 30, Points = 300, IconUrl = "/images/achievements/consistency-king.png" },

            new Achievement { Name = "Calorie Crusher", Description = "Burn 1000 calories total", Type = AchievementType.CaloriesBurned, RequiredValue = 1000, Points = 50, IconUrl = "/images/achievements/calorie-crusher.png" },
            new Achievement { Name = "Calorie Destroyer", Description = "Burn 5000 calories total", Type = AchievementType.CaloriesBurned, RequiredValue = 5000, Points = 150, IconUrl = "/images/achievements/calorie-destroyer.png" },
            new Achievement { Name = "Calorie Annihilator", Description = "Burn 10000 calories total", Type = AchievementType.CaloriesBurned, RequiredValue = 10000, Points = 400, IconUrl = "/images/achievements/calorie-annihilator.png" },

            new Achievement { Name = "Logger", Description = "Log activities for 7 different days", Type = AchievementType.ConsistentLogging, RequiredValue = 7, Points = 30, IconUrl = "/images/achievements/logger.png" },
            new Achievement { Name = "Tracking Pro", Description = "Log activities for 30 different days", Type = AchievementType.ConsistentLogging, RequiredValue = 30, Points = 100, IconUrl = "/images/achievements/tracking-pro.png" },
            new Achievement { Name = "Data Master", Description = "Log activities for 100 different days", Type = AchievementType.ConsistentLogging, RequiredValue = 100, Points = 300, IconUrl = "/images/achievements/data-master.png" },

            new Achievement { Name = "Weight Loss Beginner", Description = "Lose 1 kg", Type = AchievementType.WeightLoss, RequiredValue = 1, Points = 25, IconUrl = "/images/achievements/weight-loss-beginner.png" },
            new Achievement { Name = "Weight Loss Achiever", Description = "Lose 5 kg", Type = AchievementType.WeightLoss, RequiredValue = 5, Points = 100, IconUrl = "/images/achievements/weight-loss-achiever.png" },
            new Achievement { Name = "Transformation Champion", Description = "Lose 10 kg", Type = AchievementType.WeightLoss, RequiredValue = 10, Points = 250, IconUrl = "/images/achievements/transformation-champion.png" }
        };

        await _context.Achievements.AddRangeAsync(achievements);
    }
}
