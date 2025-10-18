namespace DTO.Mod;

public class UpdateModDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsClientside { get; set; }
    public int Downloads { get; set; }
    public double Size { get; set; }
    public string ImageUrl { get; set; } = ""; // картиначка
    public List<Guid> VersionIds { get; set; } = new();
    public List<Guid> ModLoaderIds { get; set; } = new();
    public List<Guid> TagIds { get; set; } = new();
    public List<Guid> DeveloperIds { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}