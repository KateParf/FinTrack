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
            .Include(g => g.Accounts)
            .ThenInclude(a => a.Transactions)
            .Where(g => g.UserId == userId);

        if (!includeArchived)
            query = query.Where(g => !g.IsArchived);

        var goals = await query.OrderBy(g => g.Name).ToListAsync();
        return goals.Select(ToResponse).ToList();
    }

    public async Task<SavingGoalResponse?> GetSavingGoalByIdAsync(Guid userId, Guid id)
    {
        var goal = await _context.SavingsGoals
            .Include(g => g.Accounts)
            .ThenInclude(a => a.Transactions)
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == id);

        return goal == null ? null : ToResponse(goal);
    }

    public async Task<SavingGoalResponse> AddSavingGoalAsync(Guid userId, SavingGoalRequest request)
    {
        AmountHelper.ValidatePositiveAmount(request.TargetAmount, "Target amount");
        var currencyCode = InputNormalizer.NormalizeCurrencyCode(request.CurrencyCode);
        var accounts = await GetAndValidateAccountsAsync(userId, request.AccountIds, currencyCode);

        var goal = new SavingsGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = InputNormalizer.NormalizeName(request.Name, "Saving goal name"),
            TargetAmount = request.TargetAmount,
            CurrencyCode = currencyCode,
            TargetDate = request.TargetDate,
            CreationTimeAtUtc = DateTime.UtcNow,
            UpdateTimeAtUtc = DateTime.UtcNow
        };
        foreach (var account in accounts)
        {
            goal.Accounts.Add(account);
        }

        _context.SavingsGoals.Add(goal);
        await _context.SaveChangesAsync();
        return ToResponse(goal);
    }

    public async Task<SavingGoalResponse?> UpdateSavingGoalAsync(Guid userId, Guid id, SavingGoalRequest request)
    {
        AmountHelper.ValidatePositiveAmount(request.TargetAmount, "Target amount");

        var existing = await _context.SavingsGoals
            .Include(g => g.Accounts)
            .ThenInclude(a => a.Transactions)
            .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == id);

        if (existing == null)
            return null;

        var currencyCode = InputNormalizer.NormalizeCurrencyCode(request.CurrencyCode);
        var accounts = await GetAndValidateAccountsAsync(userId, request.AccountIds, currencyCode, id);

        existing.Name = InputNormalizer.NormalizeName(request.Name, "Saving goal name");
        existing.TargetAmount = request.TargetAmount;
        existing.CurrencyCode = InputNormalizer.NormalizeCurrencyCode(request.CurrencyCode);
        existing.TargetDate = request.TargetDate;
        existing.Accounts = accounts;
        existing.UpdateTimeAtUtc = DateTime.UtcNow;

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

    private async Task<List<Account>> GetAndValidateAccountsAsync(Guid userId, IReadOnlyCollection<Guid> accountIds, string currencyCode, Guid? currentGoalId = null)
    {
        var ids = accountIds.Distinct().ToList();
        var accounts = await _context.Accounts
            .Include(a => a.Transactions)
            .Where(a => a.UserId == userId && ids.Contains(a.Id))
            .ToListAsync();

        if (accounts.Count != ids.Count)
            throw new InvalidOperationException("One or more accounts not found");
        if (accounts.Any(a => a.IsArchived))
            throw new InvalidOperationException("Archived account cannot be linked to saving goal");
        if (accounts.Any(a => a.Type is not AccountType.Savings and not AccountType.Deposit))
            throw new InvalidOperationException("Only Savings or Deposit accounts can be linked to saving goal");
        if (accounts.Any(a => a.CurrencyCode != currencyCode))
            throw new InvalidOperationException("Account currency must match saving goal currency");
        if (accounts.Any(a => a.SavingsGoalId.HasValue && a.SavingsGoalId != currentGoalId))
            throw new InvalidOperationException("Account is already linked to another saving goal");
        return accounts;
    }

    private static SavingGoalResponse ToResponse(SavingsGoal goal)
    {
        var CurrentAmount = AmountHelper.GetSavingGoalCurrentAmount(goal);
        var RemainingAmount = goal.TargetAmount - CurrentAmount;
        var IsCompleted = CurrentAmount >= goal.TargetAmount;
        var ProgressPercent = RemainingAmount == 0 ? 100 : CurrentAmount / goal.TargetAmount * 100;
        return new SavingGoalResponse(
            goal.Id,
            goal.Name,
            goal.TargetAmount,
            CurrentAmount,
            RemainingAmount >= 0 ? RemainingAmount : 0,
            ProgressPercent,
            goal.CurrencyCode,
            goal.TargetDate,
            IsCompleted,
            goal.IsArchived,
            goal.Accounts.Select(AccountsService.ToResponse).ToList(),
            goal.CreationTimeAtUtc,
            goal.UpdateTimeAtUtc);
    }

}
