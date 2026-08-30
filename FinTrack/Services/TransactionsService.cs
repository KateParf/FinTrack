using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public class TransactionsService
{
    private readonly ApplicationContext _context;

    public TransactionsService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<List<TransactionResponse>> GetTransactionsAsync(
        Guid userId,
        Guid? accountId,
        TransactionType? type,
        DateTime? from,
        DateTime? to,
        Guid? categoryId)
    {
        var query = _context.Transactions.Include(t => t.Account).Include(t => t.Category)
            .Where(t => t.Account.UserId == userId);

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        if (from.HasValue)
            query = query.Where(t => t.OccurredAtUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.OccurredAtUtc <= to.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        var transactions = await query.OrderByDescending(t => t.OccurredAtUtc).ToListAsync();
        return transactions.Select(ToResponse).ToList();
    }

    public async Task<TransactionResponse?> GetTransactionByIdAsync(Guid userId, Guid id)
    {
        var transaction = await _context.Transactions.Include(t => t.Account).Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.Account.UserId == userId);

        return transaction == null ? null : ToResponse(transaction);
    }

    public async Task<TransactionResponse> AddTransactionAsync(Guid userId, TransactionRequest request)
    {
        TransactionTypeHelper.ValidateIncomeExpenseType(request.Type);
        AmountHelper.ValidatePositiveAmount(request.Amount);

        var account = await _context.GetActiveAccountAsync(userId, request.AccountId);
        var category = await _context.GetActiveCategoryAsync(userId, request.CategoryId, request.Type);
        var now = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Account = account,
            Type = request.Type,
            CategoryId = category?.Id,
            Category = category,
            Amount = request.Amount,
            OccurredAtUtc = DateHelper.NormalizeOccurredAt(request.OccurredAtUtc),
            Note = InputNormalizer.NormalizeNote(request.Note),
            TransferGroupId = null,
            CreationTimeAtUtc = now,
            UpdateTimeAtUtc = now
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return ToResponse(transaction);
    }

    public async Task<TransactionResponse?> UpdateTransactionAsync(Guid userId, Guid id, TransactionRequest request)
    {
        TransactionTypeHelper.ValidateIncomeExpenseType(request.Type);
        AmountHelper.ValidatePositiveAmount(request.Amount);

        var existing = await _context.Transactions.Include(t => t.Account).Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.Account.UserId == userId);

        if (existing == null)
            return null;

        if (existing.TransferGroupId.HasValue || existing.Type is TransactionType.TransferIn or TransactionType.TransferOut)
            throw new InvalidOperationException("Transfer transactions must be edited through transfers endpoint");

        var account = await _context.GetActiveAccountAsync(userId, request.AccountId);
        var category = await _context.GetActiveCategoryAsync(userId, request.CategoryId, request.Type);

        existing.AccountId = account.Id;
        existing.Account = account;
        existing.Type = request.Type;
        existing.CategoryId = category?.Id;
        existing.Category = category;
        existing.Amount = request.Amount;
        existing.OccurredAtUtc = DateHelper.NormalizeOccurredAt(request.OccurredAtUtc);
        existing.Note = InputNormalizer.NormalizeNote(request.Note);
        existing.UpdateTimeAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return ToResponse(existing);
    }

    public async Task<bool> DeleteTransactionAsync(Guid userId, Guid id)
    {
        var existing = await _context.Transactions.Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == id && t.Account.UserId == userId);

        if (existing == null)
            return false;

        if (existing.TransferGroupId.HasValue || existing.Type is TransactionType.TransferIn or TransactionType.TransferOut)
            throw new InvalidOperationException("Transfer transactions must be deleted through transfers endpoint");

        _context.Transactions.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    private static TransactionResponse ToResponse(Transaction transaction)
    {
        return new TransactionResponse(
            transaction.Id,
            transaction.AccountId,
            transaction.Account.Name,
            transaction.Type,
            transaction.Note,
            transaction.CategoryId,
            transaction.Category?.Name,
            transaction.TransferGroupId,
            transaction.Amount,
            transaction.OccurredAtUtc,
            transaction.CreationTimeAtUtc,
            transaction.UpdateTimeAtUtc);
    }
}
