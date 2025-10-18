using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DAL.Entities;
using DTO.User;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace LibraryAPI_2025.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<User> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto registerUser)
    {
        try
        {
            Console.WriteLine($"🔧 Register attempt: {registerUser.Username}, {registerUser.Email}");

            // Валидация
            if (string.IsNullOrEmpty(registerUser.Username) || 
                string.IsNullOrEmpty(registerUser.Email) || 
                string.IsNullOrEmpty(registerUser.Password))
            {
                return BadRequest(new { Message = "Все поля обязательны" });
            }

            // Проверяем существующего пользователя
            var existingUser = await _userManager.FindByNameAsync(registerUser.Username);
            if (existingUser != null)
            {
                return BadRequest(new { Message = "Пользователь с таким именем уже существует" });
            }

            var existingEmail = await _userManager.FindByEmailAsync(registerUser.Email);
            if (existingEmail != null)
            {
                return BadRequest(new { Message = "Пользователь с такой почтой уже существует" });
            }

            // Создаем пользователя
            var user = new User 
            { 
                UserName = registerUser.Username.Trim(),
                Email = registerUser.Email.Trim(),
                Nickname = registerUser.Username.Trim()
            };

            var result = await _userManager.CreateAsync(user, registerUser.Password);
            
            if (result.Succeeded)
            {
                // ✅ ПОСЛЕ УСПЕШНОЙ РЕГИСТРАЦИИ СРАЗУ ГЕНЕРИРУЕМ ТОКЕН
                var authClaims = new List<Claim>
                {
                    new(ClaimTypes.Name, user.UserName),
                    new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                var token = GenerateToken(authClaims);
                
                return Ok(new
                {
                    Message = "Пользователь успешно зарегистрирован",
                    token = new JwtSecurityTokenHandler().WriteToken(token), // ← ДОБАВЛЯЕМ ТОКЕН
                    expiration = token.ValidTo
                });
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { 
                    Message = "Ошибка при создании пользователя",
                    Errors = errors
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 Exception in Register: {ex}");
            return StatusCode(500, new { Message = "Внутренняя ошибка сервера" });
        }
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserDto loginUser)
    {
        var user = await _userManager.FindByNameAsync(loginUser.Nickname);
        if (user == null || !await _userManager.CheckPasswordAsync(user, loginUser.Password))
        {
            return Unauthorized(new { Message = "Неверное имя пользователя или пароль" });
        }
        
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = GenerateToken(authClaims);
        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            expiration = token.ValidTo
        });
    }

    
    private JwtSecurityToken GenerateToken(IEnumerable<Claim> claims)
    {
        var tokenSettings = _configuration.GetSection("tokenSettings");
        var secretKey = Environment.GetEnvironmentVariable("SECRET") 
                        ?? tokenSettings["SecretKey"]
                        ?? throw new InvalidOperationException("JWT secret is not configured");
        
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        return new JwtSecurityToken(
            issuer: tokenSettings["Issuer"],
            audience: tokenSettings["Audience"],
            expires: DateTime.Now.AddHours(3),
            claims: claims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );
    }
}