using System.Text;
using Microsoft.IdentityModel.Tokens;
using FinTrack.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace FinTrack.Services;

public class JwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string, DateTime) GenerateJwtToken(User user)
    {
        var expireMinutes = double.Parse(
            _configuration["Jwt:ExpireMinutes"]
                ?? throw new InvalidOperationException("JWT expiration is not configured"));

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured")));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        
        var claims = new List<Claim> {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Required for UserManager.GetUserAsync(User) later
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty), 
            new Claim(ClaimTypes.Name, user.Name ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: signingCredentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), token.ValidTo);
    }
}
