using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CalorieManagement.Core.Entities;

namespace CalorieManagement.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<Food> Foods { get; set; }
    public DbSet<UserExerciseLog> UserExerciseLogs { get; set; }
    public DbSet<UserDietLog> UserDietLogs { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }
    public DbSet<StreakRecord> StreakRecords { get; set; }
    public DbSet<WeightRecord> WeightRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure UserProfile
        builder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithOne(u => u.UserProfile)
                  .HasForeignKey<UserProfile>(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.Weight).HasPrecision(5, 2);
            entity.Property(e => e.Height).HasPrecision(3, 2);
            entity.Property(e => e.TargetWeight).HasPrecision(5, 2);
            entity.Property(e => e.BMI).HasPrecision(4, 2);
            entity.Property(e => e.DailyCalorieGoal).HasPrecision(6, 2);
            entity.Property(e => e.DailyProteinGoal).HasPrecision(5, 2);
        });

        // Configure Exercise
        builder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CaloriesBurnedPerMinute).HasPrecision(5, 2);
        });

        // Configure Food
        builder.Entity<Food>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CaloriesPer100g).HasPrecision(6, 2);
            entity.Property(e => e.ProteinPer100g).HasPrecision(5, 2);
            entity.Property(e => e.CarbsPer100g).HasPrecision(5, 2);
            entity.Property(e => e.FatPer100g).HasPrecision(5, 2);
            entity.Property(e => e.FiberPer100g).HasPrecision(5, 2);
        });

        // Configure UserExerciseLog
        builder.Entity<UserExerciseLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.ExerciseLogs)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Exercise)
                  .WithMany(ex => ex.UserExerciseLogs)
                  .HasForeignKey(e => e.ExerciseId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CaloriesBurned).HasPrecision(6, 2);
            entity.Property(e => e.Weight).HasPrecision(5, 2);
        });

        // Configure UserDietLog
        builder.Entity<UserDietLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.DietLogs)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Food)
                  .WithMany(f => f.UserDietLogs)
                  .HasForeignKey(e => e.FoodId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.Quantity).HasPrecision(6, 2);
            entity.Property(e => e.CaloriesConsumed).HasPrecision(6, 2);
            entity.Property(e => e.ProteinConsumed).HasPrecision(5, 2);
            entity.Property(e => e.CarbsConsumed).HasPrecision(5, 2);
            entity.Property(e => e.FatConsumed).HasPrecision(5, 2);
        });

        // Configure Achievement
        builder.Entity<Achievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
        });

        // Configure UserAchievement
        builder.Entity<UserAchievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Achievements)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Achievement)
                  .WithMany(a => a.UserAchievements)
                  .HasForeignKey(e => e.AchievementId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure StreakRecord
        builder.Entity<StreakRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.StreakRecords)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure WeightRecord
        builder.Entity<WeightRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.WeightRecords)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.Weight).HasPrecision(5, 2);
            entity.HasIndex(e => new { e.UserId, e.RecordedDate });
        });
    }
}
