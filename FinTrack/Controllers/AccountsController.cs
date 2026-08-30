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
public class AccountsController : Controller
{
    private readonly AccountsService _accountsService;

    public AccountsController(AccountsService accountsService)
    {
        _accountsService = accountsService;
    }

    [HttpGet] // Получение всех счетов + фильтр по архивированным
    public async Task<ActionResult<List<AccountResponse>>> GetAccounts(
        [FromQuery] AccountType? type,
        [FromQuery] bool includeArchived = false)
    {
        var userId = User.GetCurrentUserId();
        var accounts = await _accountsService.GetAccountsAsync(userId, type, includeArchived);
        return Ok(accounts);
    }

    [HttpGet("{id:guid}")] // Получение одного счета
    public async Task<ActionResult<AccountResponse>> GetAccountById(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var account = await _accountsService.GetAccountByIdAsync(userId, id);
        return account == null ? NotFound() : Ok(account);
    }

    [HttpPost] // Создание нового счета
    public async Task<ActionResult<AccountResponse>> CreateAccount([FromBody] CreateAccountRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var account = await _accountsService.AddAccountAsync(userId, request);
            return CreatedAtAction(nameof(GetAccountById), new { id = account.Id }, account);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}")] // Частичное изменение одного счета
    public async Task<ActionResult<AccountResponse>> UpdateAccountById(Guid id, [FromBody] UpdateAccountRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var account = await _accountsService.UpdateAccountAsync(userId, id, request);
            return account == null ? NotFound() : Ok(account);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/archive")] // Архивирование счета вместо удаления
    public async Task<IActionResult> ArchiveAccountById(Guid id)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var archived = await _accountsService.ArchiveAccountByIdAsync(userId, id);
            return archived ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/restore")] // Восстановление счета из архива
    public async Task<IActionResult> RestoreAccountById(Guid id)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var restored = await _accountsService.RestoreAccountByIdAsync(userId, id);
            return restored ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}
