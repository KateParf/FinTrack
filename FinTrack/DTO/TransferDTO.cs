namespace FinTrack.Dtos;

public record TransferRequest(
    Guid FromAccountId,
    Guid ToAccountId,
    decimal Amount,
    DateTime OccurredAtUtc,
    string? Note);

public record TransferResponse(
    Guid TransferGroupId,
    Guid FromTransactionId,
    Guid ToTransactionId,
    Guid FromAccountId,
    string FromAccountName,
    Guid ToAccountId,
    string ToAccountName,
    string CurrencyCode,
    decimal Amount,
    DateTime OccurredAtUtc,
    string? Note,
    DateTime CreationTimeAtUtc,
    DateTime UpdateTimeAtUtc);
