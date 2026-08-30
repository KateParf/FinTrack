using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinTrack.Helpers;
using FinTrack.Models;
using FinTrack.Services;
using FinTrack.Dtos;

namespace FinTrack.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TransactionsController : Controller
{
    private readonly TransactionsService _transactionsService;

    public TransactionsController(TransactionsService transactionsService)
    {
        _transactionsService = transactionsService;
    }

    [HttpGet] // Получение всех операций с фильтрацией
    public async Task<ActionResult<List<TransactionResponse>>> GetTransactions(
        [FromQuery] Guid accountId,
        [FromQuery] TransactionType? type,
        [FromQuery] Guid? categoryId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var userId = User.GetCurrentUserId();
        var transactions = await _transactionsService.GetTransactionsAsync(userId, 
            accountId == Guid.Empty ? null : accountId, type, from, to, categoryId);
        return Ok(transactions);
    }

    [HttpGet("{id:guid}")] // Получение одной операции
    public async Task<ActionResult<TransactionResponse?>> GetTransactionById(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var transaction = await _transactionsService.GetTransactionByIdAsync(userId, id);
        return transaction == null ? NotFound() : Ok(transaction);
    }

    [HttpPost] // Создание дохода/расхода
    public async Task<ActionResult<TransactionResponse>> CreateTransaction([FromBody] TransactionRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var transaction = await _transactionsService.AddTransactionAsync(userId, request);
            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}")] // Редактирование операции только дохода/расхода
    public async Task<ActionResult<TransactionResponse>> UpdateTransactionById(Guid id, [FromBody] TransactionRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var transaction = await _transactionsService.UpdateTransactionAsync(userId, id, request);
            return transaction == null ? NotFound() : Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")] // Удаление операции только дохода/расхода
    public async Task<IActionResult> DeleteTransactionById(Guid id)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var result = await _transactionsService.DeleteTransactionAsync(userId, id);
            if (!result)
                return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}
