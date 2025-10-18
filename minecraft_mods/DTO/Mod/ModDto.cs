using DTO.Developer;
using DTO.ModLoader;
using DTO.ModVersion;
using DTO.Tag;

namespace DTO.Mod;

public class ModDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsClientside { get; set; }
    public int Downloads { get; set; }
    public double Size { get; set; }
    public string ImageUrl { get; set; } = ""; // для картинок
    public List<ModVersionDto> Versions { get; set; } = new();
    public List<ModLoaderDto> ModLoaders { get; set; } = new();
    public List<TagDto> Tags { get; set; } = new();
    public List<DeveloperDto> Developers { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}