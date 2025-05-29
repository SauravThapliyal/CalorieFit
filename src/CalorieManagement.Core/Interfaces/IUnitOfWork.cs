using CalorieManagement.Core.Entities;

namespace CalorieManagement.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<UserProfile> UserProfiles { get; }
    IRepository<Exercise> Exercises { get; }
    IRepository<Food> Foods { get; }
    IRepository<UserExerciseLog> UserExerciseLogs { get; }
    IRepository<UserDietLog> UserDietLogs { get; }
    IRepository<Achievement> Achievements { get; }
    IRepository<UserAchievement> UserAchievements { get; }
    IRepository<StreakRecord> StreakRecords { get; }
    IRepository<WeightRecord> WeightRecords { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
