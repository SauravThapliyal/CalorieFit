using Microsoft.EntityFrameworkCore.Storage;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;
using CalorieManagement.Infrastructure.Data;

namespace CalorieManagement.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        UserProfiles = new Repository<UserProfile>(_context);
        Exercises = new Repository<Exercise>(_context);
        Foods = new Repository<Food>(_context);
        UserExerciseLogs = new Repository<UserExerciseLog>(_context);
        UserDietLogs = new Repository<UserDietLog>(_context);
        Achievements = new Repository<Achievement>(_context);
        UserAchievements = new Repository<UserAchievement>(_context);
        StreakRecords = new Repository<StreakRecord>(_context);
        WeightRecords = new Repository<WeightRecord>(_context);
    }

    public IRepository<UserProfile> UserProfiles { get; }
    public IRepository<Exercise> Exercises { get; }
    public IRepository<Food> Foods { get; }
    public IRepository<UserExerciseLog> UserExerciseLogs { get; }
    public IRepository<UserDietLog> UserDietLogs { get; }
    public IRepository<Achievement> Achievements { get; }
    public IRepository<UserAchievement> UserAchievements { get; }
    public IRepository<StreakRecord> StreakRecords { get; }
    public IRepository<WeightRecord> WeightRecords { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
