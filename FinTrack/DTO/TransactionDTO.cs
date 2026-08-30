using FinTrack.Models;

namespace FinTrack.Dtos;

public record TransactionRequest(
    Guid AccountId,
    TransactionType Type,
    Guid? CategoryId,
    decimal Amount,
    DateTime OccurredAtUtc,
    string? Note);

public record TransactionResponse(
    Guid Id,
    Guid AccountId,
    string AccountName,
    TransactionType Type,
    string? Note,
    Guid? CategoryId,
    string? CategoryName,
    Guid? TransferGroupId,
    decimal Amount,
    DateTime OccurredAtUtc,
    DateTime CreationTimeAtUtc,
    DateTime UpdateTimeAtUtc);
