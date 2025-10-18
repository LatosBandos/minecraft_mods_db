using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryAPI_2025.Controllers;

[ApiController]
[Route("/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public UploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [Authorize]
    [HttpPost("image")]
    public async Task<ActionResult<string>> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не выбран");

            // Проверка типа файла
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Допустимы только JPG, PNG, GIF, WebP");

            // Проверка размера (5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("Максимальный размер файла - 5MB");

            // Генерация уникального имени
            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
            
            // Создаем папку если не существует
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fullPath = Path.Combine(uploadsPath, fileName);

            // Сохраняем файл
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Возвращаем URL для доступа к файлу
            var imageUrl = $"/uploads/{fileName}";
            return Ok(imageUrl);

        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка загрузки: {ex.Message}");
        }
    }
}