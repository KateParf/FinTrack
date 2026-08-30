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
public class SavingGoalsController : ControllerBase
{
    private readonly SavingGoalsService _savingGoalsService;

    public SavingGoalsController(SavingGoalsService savingGoalsService)
    {
        _savingGoalsService = savingGoalsService;
    }

    [HttpGet] // Получение всех целей + фильтр по архивированным
    public async Task<ActionResult<List<SavingGoalResponse>>> GetSavingGoals([FromQuery] bool includeArchived = false)
    {
        var userId = User.GetCurrentUserId();
        var goals = await _savingGoalsService.GetSavingGoalsAsync(userId, includeArchived);
        return Ok(goals);
    }

    [HttpGet("{id:guid}")] // Получение цели
    public async Task<ActionResult<SavingGoalResponse>> GetSavingGoalByID(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var goal = await _savingGoalsService.GetSavingGoalByIdAsync(userId, id);
        return goal == null ? NotFound() : Ok(goal);
    }

    [HttpPost] // Создание цели
    public async Task<ActionResult<SavingGoalResponse>> CreateSavingGoal([FromBody] SavingGoalRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var goal = await _savingGoalsService.AddSavingGoalAsync(userId, request);
            return CreatedAtAction(nameof(GetSavingGoalByID), new { id = goal.Id }, goal);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}")] // Частичное изменение
    public async Task<ActionResult<SavingGoalResponse>> UpdateSavingGoalByID(Guid id, [FromBody] SavingGoalRequest request) 
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var goal = await _savingGoalsService.UpdateSavingGoalAsync(userId, id, request);
            return goal == null ? NotFound() : Ok(goal);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/archive")] // Архивирование
    public async Task<IActionResult> ArchiveSavingGoalByID(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var archived = await _savingGoalsService.ArchiveSavingGoalByIdAsync(userId, id);
        return archived ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/restore")] // Восстановление
    public async Task<IActionResult> RestoreSavingGoalByID(Guid id) 
    {
        var userId = User.GetCurrentUserId();
        var restored = await _savingGoalsService.RestoreSavingGoalByIdAsync(userId, id);
        return restored ? NoContent() : NotFound();
    }

    [HttpGet("{goalId:guid}/contributions")] // Получение истории цели
    public async Task<ActionResult<List<GoalContributionResponse>>> GetSavingGoalРЎontributions(Guid goalId)
    {
        var userId = User.GetCurrentUserId();
        var contributions = await _savingGoalsService.GetContributionsAsync(userId, goalId);
        return contributions == null ? NotFound() : Ok(contributions);
    }

    [HttpPost("{goalId:guid}/contributions")] // Добавление суммы
    public async Task<ActionResult<GoalContributionResponse>> CreateSavingGoalРЎontribution(Guid goalId, [FromBody] GoalContributionRequest request) 
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var contribution = await _savingGoalsService.AddContributionAsync(userId, goalId, request);
            return contribution == null
                ? NotFound()
                : CreatedAtAction(nameof(GetSavingGoalРЎontributions), new { goalId }, contribution);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{goalId:guid}/contributions/{id:guid}")] // Изменение суммы
    public async Task<ActionResult<GoalContributionResponse>> UpdateSavingGoalРЎontribution(Guid goalId, Guid id, [FromBody] GoalContributionRequest request) 
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var contribution = await _savingGoalsService.UpdateContributionAsync(userId, goalId, id, request);
            return contribution == null ? NotFound() : Ok(contribution);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{goalId:guid}/contributions/{id:guid}")] // Удаление суммы
    public async Task<IActionResult> DeleteSavingGoalРЎontribution(Guid goalId, Guid id) 
    {
        var userId = User.GetCurrentUserId();
        var deleted = await _savingGoalsService.DeleteContributionAsync(userId, goalId, id);
        return deleted ? NoContent() : NotFound();
    }

}
