namespace FinTrack.Dtos;

public record UserRequest(
    string? Name,
    string? BaseCurrency);

public record UserResponse(
    Guid Id,
    string Name,
    string Email,
    string BaseCurrency);