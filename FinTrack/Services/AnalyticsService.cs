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

    // TODO переписать с groupBy по валютам
    public async Task<List<SummaryResponse>> GetSummaryAsync(Guid userId, Guid? accountId, DateTime? from, DateTime? to)
    {
        var query = _context.Transactions.Include(t => t.Account).Where(t => t.Account.UserId == userId
            && (t.Type == TransactionType.Income || t.Type == TransactionType.Expense));

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        if (from.HasValue)
            query = query.Where(t => t.OccurredAtUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.OccurredAtUtc <= to.Value);

        var transactions = query.ToList();
        var result = transactions.GroupBy(t => new { t.Account.CurrencyCode })
            .Select(c =>
            {
                var Expenses = c.Where(t => t.Type == TransactionType.Expense).Sum(s =>
                {
                    AmountHelper.ValidatePositiveAmount(s.Amount);
                    return s.Amount;
                });
                var Income = c.Where(t => t.Type == TransactionType.Income).Sum(s =>
                {
                    AmountHelper.ValidatePositiveAmount(s.Amount);
                    return s.Amount;
                });
                return new SummaryResponse(
                    c.Key.CurrencyCode,
                    Income,
                    Expenses,
                    Income - Expenses);
            }).ToList();
        return result;
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

        var grouped = await query.GroupBy(t => new
        {
            t.Account.CurrencyCode,
            CategoryId = t.CategoryId!.Value,
            CategoryName = t.Category!.Name
        }).Select(g => new
        {
            g.Key.CurrencyCode,
            g.Key.CategoryId,
            g.Key.CategoryName,
            Amount = g.Sum(a => a.Amount)
        }).ToListAsync();

        var totalsByCurrency = grouped.GroupBy(c => c.CurrencyCode)
        .ToDictionary(g => g.Key,
            g => g.Sum(t =>
            {
                AmountHelper.ValidatePositiveAmount(t.Amount);
                return t.Amount;
            }));

        return grouped.Select(c =>
        {
            var totalExpenses = totalsByCurrency[c.CurrencyCode];
            return new ExpensesResponse(
                c.CategoryId,
                c.CategoryName,
                c.CurrencyCode,
                c.Amount,
                totalExpenses == 0 ? 0 : c.Amount / totalExpenses * 100);
        }).OrderByDescending(a => a.Amount).ToList();
    }

    public async Task<List<BalanceHistoryResponse>> GetBalanceHistoryAsync(Guid userId, Guid? accountId, DateTime? from, DateTime? to, string groupBy)
    {
        if (groupBy is not ("day" or "week" or "month" or "year"))
            throw new InvalidOperationException("Invalid groupBy value");

        var accountsQuery = _context.Accounts.Where(a => a.UserId == userId);

        if (accountId.HasValue)
            accountsQuery = accountsQuery.Where(a => a.Id == accountId.Value);

        var openingBalance = accountsQuery.GroupBy(a => a.CurrencyCode)
            .ToDictionary(g => g.Key, g => g.Sum(o => o.OpeningBalance));

        var allTransactionsQuery = _context.Transactions.Include(t => t.Account)
            .Where(t => t.Account.UserId == userId);

        if (accountId.HasValue)
            allTransactionsQuery = allTransactionsQuery.Where(t => t.AccountId == accountId.Value);

        var balanceBeforePeriod = openingBalance;
        if (from.HasValue)
        {
            var transactionsBeforePeriod = await allTransactionsQuery
                .Where(t => t.OccurredAtUtc < from.Value).GroupBy(t => t.Account.CurrencyCode)
                .Select(g => new
                {
                    CurrencyCode = g.Key,
                    Amount = g.Sum(t =>
                        t.Type == TransactionType.Income || t.Type == TransactionType.TransferIn ? 
                        t.Amount 
                        : t.Type == TransactionType.Expense || t.Type == TransactionType.TransferOut ? 
                        -t.Amount : 0m)
                }).ToListAsync();

            foreach (var currency in transactionsBeforePeriod)
            {
                balanceBeforePeriod.TryGetValue(currency.CurrencyCode, out var currentBalance);
                balanceBeforePeriod[currency.CurrencyCode] = currentBalance + currency.Amount;
            }
        }

        if (from.HasValue)
            allTransactionsQuery = allTransactionsQuery.Where(t => t.OccurredAtUtc >= from.Value);

        if (to.HasValue)
            allTransactionsQuery = allTransactionsQuery.Where(t => t.OccurredAtUtc <= to.Value);

        var groupedAmounts = groupBy switch
        {
            "day" => allTransactionsQuery.GroupBy(t => new { t.Account.CurrencyCode, t.OccurredAtUtc.Date })
                .Select(g => new
                {
                    g.Key.CurrencyCode,
                    g.Key.Date,
                    SortKey = g.Key.Date,
                    Label = g.Key.Date.ToString("yyyy-MM-dd"),
                    Amount = g.Sum(t =>
                        t.Type == TransactionType.Income || t.Type == TransactionType.TransferIn ? 
                        t.Amount 
                        : t.Type == TransactionType.Expense || t.Type == TransactionType.TransferOut ? 
                        -t.Amount : 0m)
                }).ToList(),

            "week" => allTransactionsQuery.GroupBy(t => new
            {
                t.Account.CurrencyCode,
                Year = ISOWeek.GetYear(t.OccurredAtUtc),
                Week = ISOWeek.GetWeekOfYear(t.OccurredAtUtc)
            }).Select(g => new
            {
                g.Key.CurrencyCode,
                Date = DateHelper.FirstDateOfIsoWeek(g.Key.Year, g.Key.Week),
                SortKey = DateHelper.FirstDateOfIsoWeek(g.Key.Year, g.Key.Week),
                Label = $"{g.Key.Year}-W{g.Key.Week:D2}",
                Amount = g.Sum(t =>
                        t.Type == TransactionType.Income || t.Type == TransactionType.TransferIn ? 
                        t.Amount 
                        : t.Type == TransactionType.Expense || t.Type == TransactionType.TransferOut ? 
                        -t.Amount : 0m)
            }).ToList(),

            "month" => allTransactionsQuery.GroupBy(t => new
            {
                t.Account.CurrencyCode,
                Year = t.OccurredAtUtc.Date.Year,
                Month = t.OccurredAtUtc.Date.Month
            }).Select(g => new
            {
                g.Key.CurrencyCode,
                Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                SortKey = new DateTime(g.Key.Year, g.Key.Month, 1),
                Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("yyyy-MM"),
                Amount = g.Sum(t =>
                        t.Type == TransactionType.Income || t.Type == TransactionType.TransferIn ? 
                        t.Amount 
                        : t.Type == TransactionType.Expense || t.Type == TransactionType.TransferOut ? 
                        -t.Amount : 0m)
            }).ToList(),

            "year" => allTransactionsQuery.GroupBy(t => new
            {
                t.Account.CurrencyCode,
                Year = t.OccurredAtUtc.Date.Year
            }).Select(g => new
            {
                g.Key.CurrencyCode,
                Date = new DateTime(g.Key.Year, 1, 1),
                SortKey = new DateTime(g.Key.Year, 1, 1),
                Label = new DateTime(g.Key.Year, 1, 1).ToString(),
                Amount = g.Sum(t =>
                        t.Type == TransactionType.Income || t.Type == TransactionType.TransferIn ? 
                        t.Amount 
                        : t.Type == TransactionType.Expense || t.Type == TransactionType.TransferOut ? 
                        -t.Amount : 0m)
            }).ToList(),

            _ => throw new InvalidOperationException("Invalid groupBy value")
        };

        var runningBalances = balanceBeforePeriod;
        var result = new List<BalanceHistoryResponse>();
        foreach (var row in groupedAmounts.OrderBy(x => x.CurrencyCode).ThenBy(x => x.SortKey))
        {
            runningBalances.TryGetValue(row.CurrencyCode, out var currentBalance);
            currentBalance += row.Amount;

            runningBalances[row.CurrencyCode] = currentBalance;

            result.Add(new BalanceHistoryResponse(
                row.CurrencyCode,
                row.Label,
                currentBalance));
        }
        return result;
    }

}
