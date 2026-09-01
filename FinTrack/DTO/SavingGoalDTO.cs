using FinTrack.Models;

namespace FinTrack.Dtos;

public record SavingGoalRequest(
    string Name,
    decimal TargetAmount,
    string CurrencyCode,
    DateOnly? TargetDate,
    IReadOnlyCollection<Guid> AccountIds);

public record SavingGoalResponse(
    Guid Id,
    string Name,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal RemainingAmount,
    decimal ProgressPercent,
    string CurrencyCode,
    DateOnly? TargetDate,
    bool IsCompleted,
    bool IsArchived,
    IReadOnlyCollection<AccountResponse> Accounts,
    DateTime CreationTimeAtUtc,
    DateTime UpdateTimeAtUtc);
