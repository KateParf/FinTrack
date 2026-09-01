using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public class AccountsService
{
    private readonly ApplicationContext _context;

    public AccountsService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<List<AccountResponse>> GetAccountsAsync(Guid userId, AccountType? type, bool includeArchived)
    {
        var query = _context.Accounts
            .Include(a => a.Transactions)
            .Where(a => a.UserId == userId);

        if (type.HasValue)
            query = query.Where(a => a.Type == type.Value);

        if (!includeArchived)
            query = query.Where(a => !a.IsArchived);

        var accounts = await query.OrderBy(a => a.Name).ToListAsync();
        return accounts.Select(ToResponse).ToList();
    }

    public async Task<AccountResponse?> GetAccountByIdAsync(Guid userId, Guid id)
    {
        var account = await _context.Accounts
            .Include(a => a.Transactions)
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        return account == null ? null : ToResponse(account);
    }

    public async Task<AccountResponse> AddAccountAsync(Guid userId, CreateAccountRequest request)
    {
        var now = DateTime.UtcNow;
        var account = new Account
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = InputNormalizer.NormalizeName(request.Name, "Account name"),
            Type = request.Type,
            CurrencyCode = InputNormalizer.NormalizeCurrencyCode(request.CurrencyCode),
            OpeningBalance = request.OpeningBalance,
            CreationTimeAtUtc = now,
            UpdateTimeAtUtc = now
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
        return ToResponse(account);
    }

    public async Task<AccountResponse?> UpdateAccountAsync(Guid userId, Guid id, UpdateAccountRequest request)
    {
        var existing = await _context.Accounts
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        if (existing == null)
            return null;

        if (existing.SavingsGoalId.HasValue && request.Type is not AccountType.Savings and not AccountType.Deposit)
            throw new InvalidOperationException("Account linked to a saving goal must be Savings or Deposit");

        existing.Name = InputNormalizer.NormalizeName(request.Name, "Account name");
        existing.UpdateTimeAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetAccountByIdAsync(userId, id);
    }

    public async Task<bool> ArchiveAccountByIdAsync(Guid userId, Guid id)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        if (account == null)
            return false;

        if (account.SavingsGoalId.HasValue)
            account.SavingsGoalId = null;

        account.IsArchived = true;
        account.UpdateTimeAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAccountByIdAsync(Guid userId, Guid id)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        if (account == null)
            return false;

        account.IsArchived = false;
        account.UpdateTimeAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public static AccountResponse ToResponse(Account account)
    {
        return new AccountResponse(
            account.Id,
            account.Name,
            account.Type,
            account.CurrencyCode,
            AmountHelper.GetAccountBalance(account),
            account.IsArchived,
            account.CreationTimeAtUtc,
            account.UpdateTimeAtUtc);
    }
}
