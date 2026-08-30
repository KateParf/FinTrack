using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace FinTrack.Services;

public class AnalyticsService
{
    private readonly ApplicationContext _context;

    public AnalyticsService(ApplicationContext context)
    {
        _context = context;
    }

    public async Task<SummaryResponse> GetSummaryAsync(Guid userId, Guid? accountId, DateTime? from, DateTime? to)
    {
        var query = _context.Transactions.Include(t => t.Account).Where(t => t.Account.UserId == userId);

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        if (from.HasValue)
            query = query.Where(t => t.OccurredAtUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.OccurredAtUtc <= to.Value);

        var transactions = await query.ToListAsync();
        var Expenses = transactions.Where(t => t.Type == TransactionType.Expense)
            .Sum(t =>
            {
                AmountHelper.ValidatePositiveAmount(t.Amount);
                return t.Amount;
            });

        var Income = transactions.Where(t => t.Type == TransactionType.Income)
            .Sum(t =>
            {
                AmountHelper.ValidatePositiveAmount(t.Amount);
                return t.Amount;
            });
        var Savings = Income - Expenses;
        return new SummaryResponse(Income, Expenses, Savings);
    }

    public async Task<List<ExpensesResponse>> GetExpensesAsync(Guid userId, Guid? accountId, DateTime? from, DateTime? to)
    {
        var query = _context.Transactions.Include(t => t.Account).Include(t => t.Category)
            .Where(t => t.Account.UserId == userId && t.Type == TransactionType.Expense && t.CategoryId.HasValue);

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        if (from.HasValue)
            query = query.Where(t => t.OccurredAtUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.OccurredAtUtc <= to.Value);

        var transactions = await query.ToListAsync();
        var totalExpenses = transactions.Sum(t =>
        {
            AmountHelper.ValidatePositiveAmount(t.Amount);
            return t.Amount;
        });

        var result = transactions
            .GroupBy(t => new { t.CategoryId, t.Category!.Name })
            .Select(c =>
            {
                var amount = c.Sum(q =>
                {
                    AmountHelper.ValidatePositiveAmount(q.Amount);
                    return q.Amount;
                });
                return new ExpensesResponse(
                    c.Key.CategoryId!.Value,
                    c.Key.Name,
                    amount,
                    totalExpenses == 0 ? 0 : amount / totalExpenses * 100);
            }).ToList();

        return result;
    }

    public async Task<List<BalanceHistoryResponse>> GetBalanceHistoryAsync(Guid userId, Guid? accountId, DateTime? from, DateTime? to, string groupBy)
    {
        var accountsQuery = _context.Accounts.Where(a => a.UserId == userId);

        if (accountId.HasValue)
            accountsQuery = accountsQuery.Where(a => a.Id == accountId.Value);

        var openingBalance = await accountsQuery.SumAsync(a => a.OpeningBalance);

        var allTransactionsQuery = _context.Transactions.Include(t => t.Account)
            .Where(t => t.Account.UserId == userId);

        if (accountId.HasValue)
            allTransactionsQuery = allTransactionsQuery.Where(t => t.AccountId == accountId.Value);

        var balanceBeforePeriod = openingBalance;
        if (from.HasValue)
        {
            var transactionsBeforePeriod = await allTransactionsQuery
                .Where(t => t.OccurredAtUtc < from.Value).ToListAsync();
            balanceBeforePeriod += transactionsBeforePeriod.Sum(t => AmountHelper.GetSignedTransactionAmount(t.Type, t.Amount));
        }

        if (from.HasValue)
            allTransactionsQuery = allTransactionsQuery.Where(t => t.OccurredAtUtc >= from.Value);

        if (to.HasValue)
            allTransactionsQuery = allTransactionsQuery.Where(t => t.OccurredAtUtc <= to.Value);

        var transactions = await allTransactionsQuery.ToListAsync();

        var groupedAmounts = groupBy switch
        {
            "day" => transactions.GroupBy(t => t.OccurredAtUtc.Date)
                .Select(g => new
                {
                    SortKey = g.Key,
                    Label = g.Key.ToString("yyyy-MM-dd"),
                    Amount = g.Sum(t => AmountHelper.GetSignedTransactionAmount(t.Type, t.Amount))
                }).ToList(),

            "week" => transactions.GroupBy(t => new
            {
                Year = ISOWeek.GetYear(t.OccurredAtUtc),
                Week = ISOWeek.GetWeekOfYear(t.OccurredAtUtc)
            }).Select(g => new
            {
                SortKey = DateHelper.FirstDateOfIsoWeek(g.Key.Year, g.Key.Week),
                Label = $"{g.Key.Year}-W{g.Key.Week:D2}",
                Amount = g.Sum(t => AmountHelper.GetSignedTransactionAmount(t.Type, t.Amount))
            }).ToList(),

            "month" => transactions.GroupBy(t => new DateTime(t.OccurredAtUtc.Year, t.OccurredAtUtc.Month, 1))
                .Select(g => new
                {
                    SortKey = g.Key,
                    Label = g.Key.ToString("yyyy-MM"),
                    Amount = g.Sum(t => AmountHelper.GetSignedTransactionAmount(t.Type, t.Amount))
                }).ToList(),

            "year" => transactions.GroupBy(t => new DateTime(t.OccurredAtUtc.Year, 1, 1))
                .Select(g => new
                {
                    SortKey = g.Key,
                    Label = g.Key.Year.ToString(),
                    Amount = g.Sum(t => AmountHelper.GetSignedTransactionAmount(t.Type, t.Amount))
                }).ToList(),

            _ => throw new InvalidOperationException("Invalid groupBy value")
        };

        var runningBalance = balanceBeforePeriod;
        var result = groupedAmounts.OrderBy(g => g.SortKey)
            .Select(g =>
            {
                runningBalance += g.Amount;
                return new BalanceHistoryResponse(g.Label, runningBalance);
            }).ToList();
        return result;
    }

}
