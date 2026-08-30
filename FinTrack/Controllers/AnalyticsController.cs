using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class AnalyticsController : Controller
{
    private readonly AnalyticsService _analyticsService;

    public AnalyticsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }
    
    [HttpGet("summary")] // Общая статистика за период
    public async Task<ActionResult<SummaryResponse>> GetSummary(Guid? accountId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var userId = User.GetCurrentUserId();
        var analytics = await _analyticsService.GetSummaryAsync(userId, accountId, from, to);
        return Ok(analytics);
    }

    [HttpGet("expenses-by-category")] // Расходы по всем категориям за период
    public async Task<ActionResult<List<ExpensesResponse>>> GetExpensesByCategory(Guid? accountId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var userId = User.GetCurrentUserId();
        var analytics = await _analyticsService.GetExpensesAsync(userId, accountId, from, to);
        return Ok(analytics);
    }

    [HttpGet("balance-history")] // Динамика баланса/накоплений
    public async Task<ActionResult<List<BalanceHistoryResponse>>> GetBalanceHistory(Guid? accountId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, string groupBy)
    {
        var userId = User.GetCurrentUserId();
        var analytics = await _analyticsService.GetBalanceHistoryAsync(userId, accountId, from, to, groupBy);
        return Ok(analytics);
    }

}
