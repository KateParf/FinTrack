using FinTrack.Models;

namespace FinTrack.Dtos;

public record SavingGoalRequest(
    string Name,
    decimal TargetAmount,
    string CurrencyCode,
    DateOnly? TargetDate);

public record SavingGoalResponse(
    Guid Id,
    string Name,
    decimal TargetAmount,
    decimal CurrentAmount,
    string CurrencyCode,
    DateOnly? TargetDate,
    bool IsArchived,
    DateTime CreationTimeAtUtc);

public record GoalContributionRequest(
    GoalContributionType Type,
    decimal Amount,
    DateTime OccurredAtUtc,
    string? Note,
    Guid? TransactionId);

public record GoalContributionResponse(
    Guid Id,
    Guid GoalId,
    GoalContributionType Type,
    decimal Amount,
    DateTime OccurredAtUtc,
    string? Note,
    Guid? TransactionId,
    DateTime CreationTimeAtUtc);
