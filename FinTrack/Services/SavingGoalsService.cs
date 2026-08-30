using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public class SavingGoalsService
{
    private readonly ApplicationContext _context;

    public SavingGoalsService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<List<SavingGoalResponse>> GetSavingGoalsAsync(Guid userId, bool includeArchived)
    {
        var query = _context.SavingsGoals
            .AsNoTracking()
            .Include(g => g.Contributions)
            .Where(g => g.UserId == userId);

        if (!includeArchived)
            query = query.Where(g => !g.IsArchived);

        var goals = await query.OrderBy(g => g.Name).ToListAsync();
        return goals.Select(ToResponse).ToList();
    }

    public async Task<SavingGoalResponse?> GetSavingGoalByIdAsync(Guid userId, Guid id)
    {
        var goal = await _context.SavingsGoals
            .AsNoTracking()
            .Include(g => g.Contributions)
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == id);

        return goal == null ? null : ToResponse(goal);
    }

    public async Task<SavingGoalResponse> AddSavingGoalAsync(Guid userId, SavingGoalRequest request)
    {
        ValidateGoalRequest(request);

        var goal = new SavingsGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = InputNormalizer.NormalizeName(request.Name, "Saving goal name"),
            TargetAmount = request.TargetAmount,
            CurrencyCode = InputNormalizer.NormalizeCurrencyCode(request.CurrencyCode),
            TargetDate = request.TargetDate,
            CreationTimeAtUtc = DateTime.UtcNow
        };

        _context.SavingsGoals.Add(goal);
        await _context.SaveChangesAsync();
        return ToResponse(goal);
    }

    public async Task<SavingGoalResponse?> UpdateSavingGoalAsync(Guid userId, Guid id, SavingGoalRequest request)
    {
        ValidateGoalRequest(request);

        var existing = await _context.SavingsGoals
            .Include(g => g.Contributions)
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == id);

        if (existing == null)
            return null;

        existing.Name = InputNormalizer.NormalizeName(request.Name, "Saving goal name");
        existing.TargetAmount = request.TargetAmount;
        existing.CurrencyCode = InputNormalizer.NormalizeCurrencyCode(request.CurrencyCode);
        existing.TargetDate = request.TargetDate;

        await _context.SaveChangesAsync();
        return ToResponse(existing);
    }

    public async Task<bool> ArchiveSavingGoalByIdAsync(Guid userId, Guid id)
    {
        var goal = await _context.SavingsGoals
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == id);

        if (goal == null)
            return false;

        goal.IsArchived = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreSavingGoalByIdAsync(Guid userId, Guid id)
    {
        var goal = await _context.SavingsGoals
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == id);

        if (goal == null)
            return false;

        goal.IsArchived = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<GoalContributionResponse>?> GetContributionsAsync(Guid userId, Guid goalId)
    {
        var goalExists = await _context.SavingsGoals
            .AnyAsync(g => g.UserId == userId && g.Id == goalId);

        if (!goalExists)
            return null;

        var contributions = await _context.GoalContributions
            .AsNoTracking()
            .Where(c => c.GoalId == goalId)
            .OrderByDescending(c => c.OccurredAtUtc)
            .ToListAsync();

        return contributions.Select(ToResponse).ToList();
    }

    public async Task<GoalContributionResponse?> AddContributionAsync(Guid userId, Guid goalId, GoalContributionRequest request)
    {
        ValidateContributionRequest(request);

        var goal = await _context.GetActiveSavingGoalAsync(userId, goalId);
        if (goal == null)
            return null;

        if (request.TransactionId.HasValue)
            await _context.ValidateLinkedTransactionAsync(userId, request.TransactionId.Value);

        var contribution = new GoalContribution
        {
            Id = Guid.NewGuid(),
            GoalId = goal.Id,
            Goal = goal,
            Type = request.Type,
            Amount = request.Amount,
            OccurredAtUtc = DateHelper.NormalizeOccurredAt(request.OccurredAtUtc),
            Note = InputNormalizer.NormalizeNote(request.Note),
            TransactionId = request.TransactionId,
            CreationTimeAtUtc = DateTime.UtcNow
        };

        _context.GoalContributions.Add(contribution);
        await _context.SaveChangesAsync();
        return ToResponse(contribution);
    }

    public async Task<GoalContributionResponse?> UpdateContributionAsync(Guid userId, Guid goalId, Guid id, GoalContributionRequest request)
    {
        ValidateContributionRequest(request);

        var goalExists = await _context.SavingsGoals
            .AnyAsync(g => g.UserId == userId && g.Id == goalId);

        if (!goalExists)
            return null;

        var contribution = await _context.GoalContributions
            .FirstOrDefaultAsync(c => c.GoalId == goalId && c.Id == id);

        if (contribution == null)
            return null;

        if (request.TransactionId.HasValue)
            await _context.ValidateLinkedTransactionAsync(userId, request.TransactionId.Value);

        contribution.Type = request.Type;
        contribution.Amount = request.Amount;
        contribution.OccurredAtUtc = DateHelper.NormalizeOccurredAt(request.OccurredAtUtc);
        contribution.Note = InputNormalizer.NormalizeNote(request.Note);
        contribution.TransactionId = request.TransactionId;

        await _context.SaveChangesAsync();
        return ToResponse(contribution);
    }

    public async Task<bool> DeleteContributionAsync(Guid userId, Guid goalId, Guid id)
    {
        var goalExists = await _context.SavingsGoals
            .AnyAsync(g => g.UserId == userId && g.Id == goalId);

        if (!goalExists)
            return false;

        var contribution = await _context.GoalContributions
            .FirstOrDefaultAsync(c => c.GoalId == goalId && c.Id == id);

        if (contribution == null)
            return false;

        _context.GoalContributions.Remove(contribution);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void ValidateGoalRequest(SavingGoalRequest request)
    {
        AmountHelper.ValidatePositiveAmount(request.TargetAmount, "Target amount");
    }

    private static void ValidateContributionRequest(GoalContributionRequest request)
    {
        AmountHelper.ValidatePositiveAmount(request.Amount);
    }

    private static SavingGoalResponse ToResponse(SavingsGoal goal)
    {
        return new SavingGoalResponse(
            goal.Id,
            goal.Name,
            goal.TargetAmount,
            AmountHelper.GetSavingGoalCurrentAmount(goal),
            goal.CurrencyCode,
            goal.TargetDate,
            goal.IsArchived,
            goal.CreationTimeAtUtc);
    }

    private static GoalContributionResponse ToResponse(GoalContribution contribution)
    {
        return new GoalContributionResponse(
            contribution.Id,
            contribution.GoalId,
            contribution.Type,
            contribution.Amount,
            contribution.OccurredAtUtc,
            contribution.Note,
            contribution.TransactionId,
            contribution.CreationTimeAtUtc);
    }
}
