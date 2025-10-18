using DAL.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DAL.EF;

public class ApplicationContext : IdentityDbContext<User>
{
    public DbSet<Mod> Mods { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ModVersion> ModVersions { get; set; }
    public DbSet<ModLoader> ModLoaders { get; set; }
    public DbSet<Developer> Developers { get; set; }
    public DbSet<Collection> Collections { get; set; }
    public DbSet<Difficulty> Difficulties { get; set; }
    public DbSet<Focus> Focuses { get; set; }

    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
    {
    // Database.EnsureCreated();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        new ModMap(modelBuilder.Entity<Mod>());
        new TagMap(modelBuilder.Entity<Tag>());
        new VersionMap(modelBuilder.Entity<ModVersion>());
        new ModLoaderMap(modelBuilder.Entity<ModLoader>());
        new DeveloperMap(modelBuilder.Entity<Developer>());
        new CollectionMap(modelBuilder.Entity<Collection>());
        new DifficultyMap(modelBuilder.Entity<Difficulty>());
        new FocusMap(modelBuilder.Entity<Focus>());
    }
}