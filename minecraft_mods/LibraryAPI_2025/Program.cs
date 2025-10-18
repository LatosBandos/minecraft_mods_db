using System.Text;
using BLL.Interfaces;
using BLL.Services;
using DAL.EF;
using DAL.Entities;
using DAL.Interfaces;
using DAL.Repositories;
using DTO.Collection;
using DTO.Developer;
using DTO.Difficulty;
using DTO.Focus;
using DTO.Mod;
using DTO.ModLoader;
using DTO.Tag;
using DTO.ModVersion;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Подключение к БД
string connection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationContext>(options => options.UseNpgsql(connection));

// Конфигурация JWT
var tokenSettings = builder.Configuration.GetSection("TokenSettings");
var secretKey = Environment.GetEnvironmentVariable("SECRET") 
    ?? tokenSettings["SecretKey"] 
    ?? throw new InvalidOperationException("JWT secret is not configured");

// Добавление Identity
builder.Services
    .AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationContext>()
    .AddDefaultTokenProviders();

// Репозитории
builder.Services.AddTransient<IRepository<ModDto, CreateModDto, UpdateModDto>, ModRepository>();
builder.Services.AddTransient<IRepository<TagDto, CreateTagDto, UpdateTagDto>, TagRepository>();
builder.Services.AddTransient<IRepository<ModVersionDto, CreateModVersionDto, UpdateModVersionDto>, VersionRepository>();
builder.Services.AddTransient<IRepository<ModLoaderDto, CreateModLoaderDto, UpdateModLoaderDto>, ModLoaderRepository>();
builder.Services.AddTransient<IRepository<DeveloperDto, CreateDeveloperDto, UpdateDeveloperDto>, DeveloperRepository>();
builder.Services.AddTransient<IRepository<CollectionDto, CreateCollectionDto, UpdateCollectionDto>, CollectionRepository>();
builder.Services.AddTransient<IRepository<DifficultyDto, CreateDifficultyDto, UpdateDifficultyDto>, DifficultyRepository>();
builder.Services.AddTransient<IRepository<FocusDto, CreateFocusDto, UpdateFocusDto>, FocusRepository>();

// Сервисы
builder.Services.AddScoped<IService<ModDto, CreateModDto, UpdateModDto>, ModService>();
builder.Services.AddScoped<IService<TagDto, CreateTagDto, UpdateTagDto>, TagService>();
builder.Services.AddScoped<IService<ModVersionDto, CreateModVersionDto, UpdateModVersionDto>, VersionService>();
builder.Services.AddScoped<IService<ModLoaderDto, CreateModLoaderDto, UpdateModLoaderDto>, ModLoaderService>();
builder.Services.AddScoped<IService<DeveloperDto, CreateDeveloperDto, UpdateDeveloperDto>, DeveloperService>();
builder.Services.AddScoped<IService<CollectionDto, CreateCollectionDto, UpdateCollectionDto>, CollectionService>();
builder.Services.AddScoped<IService<DifficultyDto, CreateDifficultyDto, UpdateDifficultyDto>, DifficultyService>();
builder.Services.AddScoped<IService<FocusDto, CreateFocusDto, UpdateFocusDto>, FocusService>();

// Настройка аутентификации
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = tokenSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = tokenSettings["Audience"],
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuerSigningKey = true
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    if (await userManager.FindByNameAsync("UserOleg") == null)
    {
        var user = new User 
        { 
            UserName = "UserOleg",
            Email = "user@example.com",
            Nickname = "UserOleg" 
        };
        var result = await userManager.CreateAsync(user, "AboBa13666-");
        
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"Error: {error.Description}");
            }
        }
    }
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")),
    RequestPath = "/uploads"
});

// Middleware pipeline
app.UseRouting();

app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();