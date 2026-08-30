using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using FinTrack.Models;
using FinTrack.Services;
using FinTrack.Dtos;
using FinTrack.Helpers;

namespace FinTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : Controller
{
    private readonly JwtTokenService _jwtService;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(JwtTokenService jwtService, UserManager<User> userManager, SignInManager<User> signInManager)
    {
        _jwtService = jwtService;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Registration([FromBody] RegistrationRequest request)
    {
        var userExists = await _userManager.FindByEmailAsync(request.Email);
        if (userExists != null) return BadRequest("A user with this email already exists");

        User user = new User
        {
            Id = Guid.NewGuid(),
            Email = InputNormalizer.NormalizeEmail(request.Email),
            UserName = InputNormalizer.NormalizeEmail(request.Email),
            Name = InputNormalizer.NormalizeName(request.Name, "User name"),
            BaseCurrency = InputNormalizer.NormalizeCurrencyCode(request.BaseCurrency),
            CreationTimeAtUtc = DateTime.UtcNow
        };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (result.Succeeded)
        {
            var token = _jwtService.GenerateJwtToken(user);
            return Ok(new AuthResponse(
                token.Item1,
                token.Item2
            ));
        }
        else return BadRequest(new { result.Errors });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // Use signInManager to check user password validity
        if (user != null)
        {
            var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            if (passwordCheck.Succeeded)
            {
                var token = _jwtService.GenerateJwtToken(user);
                return Ok(new AuthResponse(
                    token.Item1,
                    token.Item2
                ));
            }
            else if (passwordCheck.IsLockedOut) return BadRequest("Number of password attempts has been exceeded");
            else return BadRequest("Wrong password");
        }
        else return BadRequest("User not found");
    }

}
