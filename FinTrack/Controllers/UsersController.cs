using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinTrack.Helpers;
using FinTrack.Services;
using FinTrack.Dtos;

namespace FinTrack.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : Controller
{
    private readonly UsersService _usersService;
    
    public UsersController(UsersService usersService)
    {
        _usersService = usersService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetUser()
    {
        var userId = User.GetCurrentUserId();
        var user = await _usersService.GetUserByIdAsync(userId);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPatch("me")]
    public async Task<ActionResult<UserResponse>> UpdateUser([FromBody] UserRequest request)
    {
        try
        {
            var userId = User.GetCurrentUserId();
            var user = await _usersService.UpdateUserAsync(userId, request);
            return user == null ? NotFound() : Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}
