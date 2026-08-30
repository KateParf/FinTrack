using FinTrack.Models;

namespace FinTrack.Dtos;

public record SummaryResponse(
    decimal Income,
    decimal Expenses,
    decimal Savings);

public record ExpensesResponse(
    Guid CategoryId,
    string CategoryName,
    decimal Amount,
    decimal Percentage
);

public record BalanceHistoryResponse(
    string Date,
    decimal Amount
);
