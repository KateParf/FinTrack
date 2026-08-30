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
public class CategoriesController : ControllerBase
{
    private readonly CategoriesService _categoriesService;

    public CategoriesController(CategoriesService categoriesService)
    {
        _categoriesService = categoriesService;
    }

    [HttpGet] // Получение всех счетов + фильтр по архивированным
    public async Task<ActionResult<List<CategoryResponse>>> GetCategories(
        [FromQuery] CategoryType? type,
        [FromQuery] bool includeArchived = false)
    {
        var userId = User.GetCurrentUserId();
        var categories = await _categoriesService.GetCategoriesAsync(userId, type, includeArchived);
        return Ok(categories);
    }

    [HttpGet("{id:guid}")] // Получение одной категории
    public async Task<ActionResult<CategoryResponse>> GetCategoryById(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var category = await _categoriesService.GetCategoryByIdAsync(userId, id);
        return category == null ? NotFound() : Ok(category);
    }

    [HttpPost] // Создание новой категории
    public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var category = await _categoriesService.AddCategoryAsync(userId, request);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}")] // Частичное изменение категории
    public async Task<ActionResult<CategoryResponse>> UpdateCategoryById(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var category = await _categoriesService.UpdateCategoryAsync(userId, id, request);
            return category == null ? NotFound() : Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/archive")] // Архивирование категории вместо удаления
    public async Task<IActionResult> ArchiveCategoryById(Guid id)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var archived = await _categoriesService.ArchiveCategoryByIdAsync(userId, id);
            return archived ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/restore")] // Восстановление категории из архива
    public async Task<IActionResult> RestoreCategoryById(Guid id)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var restored = await _categoriesService.RestoreCategoryByIdAsync(userId, id);
            return restored ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}

