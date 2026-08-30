using FinTrack.Models;

namespace FinTrack.Dtos;

public record CreateCategoryRequest(
    string Name,
    CategoryType Type,
    Guid? ParentCategoryId);

public record UpdateCategoryRequest(
    string Name,
    Guid? ParentCategoryId);

public record CategoryResponse(
    Guid Id,
    string Name,
    CategoryType Type,
    Guid? ParentCategoryId,
    bool IsArchived,
    List<CategoryResponse> Children);