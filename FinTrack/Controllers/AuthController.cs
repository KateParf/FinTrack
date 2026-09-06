using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using FinTrack.Models;
using FinTrack.Services;
using FinTrack.Dtos;
using FinTrack.Helpers;
using Microsoft.AspNetCore.Authorization;

namespace FinTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : Controller
{
    private const string RefreshTokenCookieName = "fintrack_refresh_token";
    private readonly JwtTokenService _jwtService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IWebHostEnvironment _environment;

    public AuthController(JwtTokenService jwtService, RefreshTokenService refreshTokenService,
        UserManager<User> userManager, SignInManager<User> signInManager, IWebHostEnvironment environment)
    {
        _jwtService = jwtService;
        _refreshTokenService = refreshTokenService;
        _userManager = userManager;
        _signInManager = signInManager;
        _environment = environment;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Registration([FromBody] RegistrationRequest request)
    {
        var email = InputNormalizer.NormalizeEmail(request.Email);
        var userExists = await _userManager.FindByEmailAsync(email);
        if (userExists != null) return BadRequest("A user with this email already exists");

        User user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = email,
            Name = InputNormalizer.NormalizeName(request.Name, "User name"),
            BaseCurrency = InputNormalizer.NormalizeCurrencyCode(request.BaseCurrency),
            CreationTimeAtUtc = DateTime.UtcNow
        };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { result.Errors });

        var response = await CreateSessionAsync(user);
        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var email = InputNormalizer.NormalizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(email);

        // Use signInManager to check user password validity
        if (user != null)
        {
            var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            if (passwordCheck.Succeeded)
            {
                var response = await CreateSessionAsync(user);
                return Ok(response);
            }
            else if (passwordCheck.IsLockedOut) return BadRequest("Number of password attempts has been exceeded");
            else return BadRequest("Wrong password");
        }
        else return BadRequest("User not found");
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        if (!Request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized();
        }

        var rotationResult = await _refreshTokenService.RotateAsync(refreshToken);

        if (rotationResult == null)
        {
            DeleteRefreshTokenCookie();
            return Unauthorized();
        }

        var accessToken = _jwtService.GenerateJwtToken(rotationResult.User);
        SetRefreshTokenCookie(rotationResult.Token, rotationResult.ExpiresAtUtc);
        return Ok(new AuthResponse(accessToken.Item1, accessToken.Item2));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) &&
            !string.IsNullOrWhiteSpace(refreshToken))
        {
            await _refreshTokenService.RevokeAsync(refreshToken);
        }
        DeleteRefreshTokenCookie();
        return NoContent();
    }

    private async Task<AuthResponse> CreateSessionAsync(User user)
    {
        var accessToken = _jwtService.GenerateJwtToken(user);
        var refreshToken = await _refreshTokenService.IssueAsync(user.Id);
        SetRefreshTokenCookie(refreshToken.Token, refreshToken.ExpiresAtUtc);
        return new AuthResponse(accessToken.Item1, accessToken.Item2);
    }

    private void SetRefreshTokenCookie(string token, DateTime expiresAtUtc)
    {
        Response.Cookies.Append(RefreshTokenCookieName, token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = new DateTimeOffset(expiresAtUtc),
                Path = "/api/auth"
            });
    }

    private void DeleteRefreshTokenCookie()
    {
        Response.Cookies.Delete(RefreshTokenCookieName,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Path = "/api/auth"
            });
    }

}
