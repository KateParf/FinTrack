namespace FinTrack.Dtos;

public record SummaryResponse(
    string CurrencyCode,
    decimal Income,
    decimal Expenses,
    decimal Savings);

public record ExpensesResponse(
    Guid CategoryId,
    string CategoryName,
    string CurrencyCode,
    decimal Amount,
    decimal Percentage
);

public record BalanceHistoryResponse(
    string CurrencyCode,
    string Date,
    decimal Amount
);
