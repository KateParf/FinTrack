using FinTrack.Models;

namespace FinTrack.Dtos;

public record CreateAccountRequest(
    string Name,
    AccountType Type,
    string CurrencyCode,
    decimal OpeningBalance);

public record UpdateAccountRequest(
    string Name,
    AccountType Type);

public record AccountResponse(
    Guid Id,
    string Name,
    AccountType Type,
    string CurrencyCode,
    decimal Balance,
    bool IsArchived,
    DateTime CreationTimeAtUtc,
    DateTime UpdateTimeAtUtc);
