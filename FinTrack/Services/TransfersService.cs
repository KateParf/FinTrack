using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Services;

public class TransfersService
{
    private readonly ApplicationContext _context;

    public TransfersService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<TransferResponse?> GetTransferByGroupIdAsync(Guid userId, Guid transferGroupId)
    {
        var transactions = await GetTransferPairQuery(userId, transferGroupId).ToListAsync();
        return transactions.Count == 0 ? null : ToResponse(transactions);
    }

    public async Task<TransferResponse> CreateTransferAsync(Guid userId, TransferRequest request)
    {
        AmountHelper.ValidatePositiveAmount(request.Amount);

        if (request.FromAccountId == request.ToAccountId)
            throw new InvalidOperationException("Transfer accounts must be different");

        var fromAccount = await _context.GetActiveAccountAsync(userId, request.FromAccountId);
        var toAccount = await _context.GetActiveAccountAsync(userId, request.ToAccountId);

        if (fromAccount.CurrencyCode != toAccount.CurrencyCode)
            throw new InvalidOperationException("Transfer accounts must have the same currency");

        var now = DateTime.UtcNow;
        var transferGroupId = Guid.NewGuid();
        var occurredAtUtc = DateHelper.NormalizeOccurredAt(request.OccurredAtUtc);
        var note = InputNormalizer.NormalizeNote(request.Note);

        var transferOut = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = fromAccount.Id,
            Account = fromAccount,
            Type = TransactionType.TransferOut,
            Amount = request.Amount,
            OccurredAtUtc = occurredAtUtc,
            TransferGroupId = transferGroupId,
            Note = note,
            CreationTimeAtUtc = now,
            UpdateTimeAtUtc = now
        };

        var transferIn = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = toAccount.Id,
            Account = toAccount,
            Type = TransactionType.TransferIn,
            Amount = request.Amount,
            OccurredAtUtc = occurredAtUtc,
            TransferGroupId = transferGroupId,
            Note = note,
            CreationTimeAtUtc = now,
            UpdateTimeAtUtc = now
        };

        _context.Transactions.AddRange(transferOut, transferIn);
        await _context.SaveChangesAsync();

        return ToResponse([transferOut, transferIn]);
    }

    public async Task<TransferResponse?> UpdateTransferAsync(Guid userId, Guid transferGroupId, TransferRequest request)
    {
        AmountHelper.ValidatePositiveAmount(request.Amount);

        if (request.FromAccountId == request.ToAccountId)
            throw new InvalidOperationException("Transfer accounts must be different");

        var transferPair = await GetTransferPairQuery(userId, transferGroupId).ToListAsync();
        if (transferPair.Count == 0)
            return null;

        ValidateTransferPair(transferPair);

        var fromAccount = await _context.GetActiveAccountAsync(userId, request.FromAccountId);
        var toAccount = await _context.GetActiveAccountAsync(userId, request.ToAccountId);

        if (fromAccount.CurrencyCode != toAccount.CurrencyCode)
            throw new InvalidOperationException("Transfer accounts must have the same currency");

        var transferOut = transferPair.Single(t => t.Type == TransactionType.TransferOut);
        var transferIn = transferPair.Single(t => t.Type == TransactionType.TransferIn);
        
        var now = DateTime.UtcNow;
        var occurredAtUtc = DateHelper.NormalizeOccurredAt(request.OccurredAtUtc);
        var note = InputNormalizer.NormalizeNote(request.Note);

        transferOut.AccountId = fromAccount.Id;
        transferOut.Account = fromAccount;
        transferOut.Amount = request.Amount;
        transferOut.OccurredAtUtc = occurredAtUtc;
        transferOut.Note = note;
        transferOut.UpdateTimeAtUtc = now;

        transferIn.AccountId = toAccount.Id;
        transferIn.Account = toAccount;
        transferIn.Amount = request.Amount;
        transferIn.OccurredAtUtc = occurredAtUtc;
        transferIn.Note = note;
        transferIn.UpdateTimeAtUtc = now;

        await _context.SaveChangesAsync();
        return ToResponse(transferPair);
    }

    public async Task<bool> DeleteTransferAsync(Guid userId, Guid transferGroupId)
    {
        var transferPair = await GetTransferPairQuery(userId, transferGroupId).ToListAsync();
        if (transferPair.Count == 0)
            return false;

        ValidateTransferPair(transferPair);

        _context.Transactions.RemoveRange(transferPair);
        await _context.SaveChangesAsync();
        return true;
    }

    private IQueryable<Transaction> GetTransferPairQuery(Guid userId, Guid transferGroupId)
    {
        return _context.Transactions.Include(t => t.Account)
            .Where(t =>
                t.Account.UserId == userId &&
                t.TransferGroupId == transferGroupId &&
                (t.Type == TransactionType.TransferOut || t.Type == TransactionType.TransferIn));
    }

    private static void ValidateTransferPair(List<Transaction> transactions)
    {
        if (transactions.Count != 2 ||
            transactions.Count(t => t.Type == TransactionType.TransferOut) != 1 ||
            transactions.Count(t => t.Type == TransactionType.TransferIn) != 1)
        {
            throw new InvalidOperationException("Transfer pair is corrupted");
        }
    }

    private static TransferResponse ToResponse(List<Transaction> transactions)
    {
        ValidateTransferPair(transactions);

        var transferOut = transactions.Single(t => t.Type == TransactionType.TransferOut);
        var transferIn = transactions.Single(t => t.Type == TransactionType.TransferIn);

        return new TransferResponse(
            transferOut.TransferGroupId!.Value,
            transferOut.Id,
            transferIn.Id,
            transferOut.AccountId,
            transferOut.Account.Name,
            transferIn.AccountId,
            transferIn.Account.Name,
            transferOut.Account.CurrencyCode,
            transferOut.Amount,
            transferOut.OccurredAtUtc,
            transferOut.Note,
            transferOut.CreationTimeAtUtc < transferIn.CreationTimeAtUtc ? transferOut.CreationTimeAtUtc : transferIn.CreationTimeAtUtc,
            transferOut.UpdateTimeAtUtc > transferIn.UpdateTimeAtUtc ? transferOut.UpdateTimeAtUtc : transferIn.UpdateTimeAtUtc);
    }
}
