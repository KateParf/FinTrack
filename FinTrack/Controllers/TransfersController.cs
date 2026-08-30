using FinTrack.Dtos;
using FinTrack.Helpers;
using FinTrack.Models;
using FinTrack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TransfersController : ControllerBase
{
    private readonly TransfersService _transfersService;

    public TransfersController(TransfersService transfersService)
    {
        _transfersService = transfersService;
    }

    [HttpGet("{id:guid}")] // Получение одной операции
    public async Task<ActionResult<TransferResponse>> GetTranferByGroupID(Guid id) 
    {
        var userId = User.GetCurrentUserId();
        var transfer = await _transfersService.GetTransferByGroupIdAsync(userId, id);
        return transfer == null ? NotFound() : Ok(transfer);
    }

    [HttpPost] // Создание перевода между счетами
    public async Task<ActionResult<TransferResponse>> CreateTranfer([FromBody] TransferRequest request) 
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var transfer = await _transfersService.CreateTransferAsync(userId, request);
            return CreatedAtAction(nameof(GetTranferByGroupID), new { id = transfer.TransferGroupId }, transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}")] // Редактирование операции
    public async Task<ActionResult<TransferResponse>> UpdateTranferByGroupID(Guid id, [FromBody] TransferRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var transfer = await _transfersService.UpdateTransferAsync(userId, id, request);
            return transfer == null ? NotFound() : Ok(transfer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")] // Удаление операции
    public async Task<IActionResult> DeleteTranferByGroupID(Guid id) 
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var deleted = await _transfersService.DeleteTransferAsync(userId, id);
            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}
