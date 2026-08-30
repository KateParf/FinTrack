namespace FinTrack.Dtos;

public record LoginRequest(
    string Email,
    string Password);

public record RegistrationRequest(
    string Name,
    string Email,
    string Password,
    string BaseCurrency);

public record AuthResponse(
    string AccessToken,
    DateTime ExpiresAtUtc);
