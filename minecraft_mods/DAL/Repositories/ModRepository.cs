using DAL.EF;
using DAL.Entities;
using DAL.Interfaces;
using DTO.Mod;
using DTO.ModLoader;
using DTO.ModVersion;
using DTO.Shared;
using DTO.Tag;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using DTO.Developer;

namespace DAL.Repositories;

public class ModRepository(ApplicationContext context) : IRepository<ModDto, CreateModDto, UpdateModDto>
{
    public async Task<List<ModDto>> GetAll()
    {
        List<Mod> mods = await context.Mods
            .Include(m => m.Versions)
            .Include(m => m.ModLoaders)
            .Include(m => m.Tags)
            .Include(m => m.Developers)
            .ToListAsync();

        return mods.Select(mod => new ModDto()
        {
            Id = mod.Id,
            Title = mod.Title,
            Description = mod.Description,
            IsClientside = mod.IsClientside,
            Downloads = mod.Downloads,
            Size = mod.Size,
            ImageUrl = mod.ImageUrl, // ← ДОБАВЛЕНО
            Versions = mod.Versions.Select(v => new ModVersionDto()
            {
                Id = v.Id,
                Title = v.Title,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.UpdatedAt
            }).ToList(),
            ModLoaders = mod.ModLoaders.Select(l => new ModLoaderDto()
            {
                Id = l.Id,
                Title = l.Title,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            }).ToList(),
            Tags = mod.Tags.Select(t => new TagDto()
            {
                Id = t.Id,
                Title = t.Title,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList(),
            Developers = mod.Developers.Select(d => new DeveloperDto()
            {
                Id = d.Id,
                Nickname = d.Nickname,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            CreatedAt = mod.CreatedAt,
            UpdatedAt = mod.UpdatedAt
        }).ToList();
    }

    public async Task<QueryParamsDto<ModDto>> GetByPage(QueryParamsDto<ModDto> queryParams)
    {
        var totalCount = await context.Mods.CountAsync();
        string sorting = $"{queryParams.SortBy} {(queryParams.OrderBy?.ToLower() == "desc" ? "descending" : "ascending")}";
        
        var mods = context.Mods
            .Include(m => m.Versions)
            .Include(m => m.ModLoaders)
            .Include(m => m.Tags)
            .Include(m => m.Developers)
            .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .AsQueryable();
        
        if (queryParams.Search != string.Empty)
        {
            mods = mods
                .Where(m =>
                    m.Title.ToLower().Contains(queryParams.Search.ToLower())
                    || m.Description.ToLower().Contains(queryParams.Search.ToLower())
                    );
        }
        if (queryParams.VersionIds.Any())
        {
            mods = mods
                .Where(m => m.Versions.Any(v => queryParams.VersionIds.Contains(v.Id)));
        }
        if (queryParams.ModLoaderIds.Any())
        {
            mods = mods
                .Where(m => m.ModLoaders.Any(l => queryParams.ModLoaderIds.Contains(l.Id)));
        }
        if (queryParams.TagIds.Any())
        {
            mods = mods
                .Where(m => m.Tags.Any(t => queryParams.TagIds.Contains(t.Id)));
        }
        
        var items = mods
            .OrderBy(sorting)
            .Select(m => new ModDto()
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            IsClientside = m.IsClientside,
            Downloads = m.Downloads,
            Size = m.Size,
            ImageUrl = m.ImageUrl, // ← ДОБАВЛЕНО
            Versions = m.Versions.Select(v => new ModVersionDto()
            {
                Id = v.Id,
                Title = v.Title,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.UpdatedAt
            }).ToList(),
            ModLoaders = m.ModLoaders.Select(l => new ModLoaderDto()
            {
                Id = l.Id,
                Title = l.Title,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            }).ToList(),
            Tags = m.Tags.Select(t => new TagDto()
            {
                Id = t.Id,
                Title = t.Title,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList(),
            Developers = m.Developers.Select(d => new DeveloperDto()
            {
                Id = d.Id,
                Nickname = d.Nickname,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt
        }).ToList();

        return new QueryParamsDto<ModDto>()
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = queryParams.PageNumber,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<ModDto> GetById(Guid id)
    {
        Mod? mod = await context.Mods
            .Include(m => m.Versions)
            .Include(m => m.ModLoaders)
            .Include(m => m.Tags)
            .Include(m => m.Developers)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (mod == null)
        {
            throw new KeyNotFoundException($"Mod with id {id} not found");
        }
        
        return new ModDto()
        {
            Id = mod.Id,
            Title = mod.Title,
            Description = mod.Description,
            IsClientside = mod.IsClientside,
            Downloads = mod.Downloads,
            Size = mod.Size,
            ImageUrl = mod.ImageUrl, // ← ДОБАВЛЕНО
            Versions = mod.Versions.Select(v => new ModVersionDto()
            {
                Id = v.Id,
                Title = v.Title,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.UpdatedAt
            }).ToList(),
            ModLoaders = mod.ModLoaders.Select(l => new ModLoaderDto()
            {
                Id = l.Id,
                Title = l.Title,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            }).ToList(),
            Tags = mod.Tags.Select(t => new TagDto()
            {
                Id = t.Id,
                Title = t.Title,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList(),
            Developers = mod.Developers.Select(d => new DeveloperDto()
            {
                Id = d.Id,
                Nickname = d.Nickname,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            CreatedAt = mod.CreatedAt,
            UpdatedAt = mod.UpdatedAt
        };
    }

    public async Task<ModDto> Create(CreateModDto mod)
    {
        var versions = await context.ModVersions
            .Where(v => mod.VersionIds.Contains(v.Id))
            .ToListAsync();
        
        var loaders = await context.ModLoaders
            .Where(l => mod.ModLoaderIds.Contains(l.Id))
            .ToListAsync();
        
        var tags = await context.Tags
            .Where(t => mod.TagIds.Contains(t.Id))
            .ToListAsync();
        
        var developers = await context.Developers
            .Where(d => mod.DeveloperIds.Contains(d.Id))
            .ToListAsync();
        
        Mod createdMod = new()
        {
            Title = mod.Title,
            Description = mod.Description,
            Versions = versions,
            ModLoaders = loaders,
            Tags = tags,
            Developers = developers,
            IsClientside = mod.IsClientside,
            Downloads = mod.Downloads,
            Size = mod.Size,
            ImageUrl = mod.ImageUrl, // ← ДОБАВЛЕНО
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (string.IsNullOrWhiteSpace(mod.Title))
        {
            throw new ArgumentException("Title cannot be empty");
        }
        
        if (mod.Title.Length > 100)
        {
            throw new ArgumentException("Title is too long (max 100 chars)");
        }
        
        if (mod.Description != null && mod.Description.Length > 1000)
        {
            throw new ArgumentException("Description is too long (max 1000 chars)");
        }

        if (mod.VersionIds == null || !mod.VersionIds.Any())
        {
            throw new ArgumentException("At least one version must be specified");
        }

        if (mod.ModLoaderIds == null || !mod.ModLoaderIds.Any())
        {
            throw new ArgumentException("At least one mod loader must be specified");
        }

        if (mod.DeveloperIds == null || !mod.DeveloperIds.Any())
        {
            throw new ArgumentException("At least one developer must be specified");
        }
        
        context.Mods.Add(createdMod);
        await context.SaveChangesAsync();
        
        return new ModDto()
        {
            Id = createdMod.Id,
            Title = createdMod.Title,
            Description = createdMod.Description,
            IsClientside = createdMod.IsClientside,
            Downloads = createdMod.Downloads,
            Size = createdMod.Size,
            ImageUrl = createdMod.ImageUrl, // ← ДОБАВЛЕНО
            Versions = createdMod.Versions.Select(v => new ModVersionDto()
            {
                Id = v.Id,
                Title = v.Title,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.UpdatedAt
            }).ToList(),
            ModLoaders = createdMod.ModLoaders.Select(l => new ModLoaderDto()
            {
                Id = l.Id,
                Title = l.Title,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            }).ToList(),
            Tags = createdMod.Tags.Select(t => new TagDto()
            {
                Id = t.Id,
                Title = t.Title,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList(),
            Developers = createdMod.Developers.Select(d => new DeveloperDto()
            {
                Id = d.Id,
                Nickname = d.Nickname,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            CreatedAt = createdMod.CreatedAt,
            UpdatedAt = createdMod.UpdatedAt
        };
    }

    public async Task<ModDto> Update(UpdateModDto mod)
    {
        Mod? updatedMod = await context.Mods
            .Include(m => m.Versions)
            .Include(m => m.ModLoaders)
            .Include(m => m.Tags)
            .Include(m => m.Developers)
            .FirstOrDefaultAsync(m => m.Id == mod.Id);

        if (updatedMod == null)
        {
            throw new KeyNotFoundException($"Mod with id {mod.Id} not found");
        }
        
        var versions = await context.ModVersions
            .Where(v => mod.VersionIds.Contains(v.Id))
            .ToListAsync();
        
        var loaders = await context.ModLoaders
            .Where(l => mod.ModLoaderIds.Contains(l.Id))
            .ToListAsync();
        
        var tags = await context.Tags
            .Where(t => mod.TagIds.Contains(t.Id))
            .ToListAsync();
        
        var developers = await context.Developers
            .Where(d => mod.DeveloperIds.Contains(d.Id))
            .ToListAsync();
        
        updatedMod.Title = mod.Title;
        updatedMod.Description = mod.Description;
        updatedMod.Versions = versions;
        updatedMod.ModLoaders = loaders;
        updatedMod.Tags = tags;
        updatedMod.Developers = developers;
        updatedMod.IsClientside = mod.IsClientside;
        updatedMod.Downloads = mod.Downloads;
        updatedMod.Size = mod.Size;
        updatedMod.ImageUrl = mod.ImageUrl; // ← ДОБАВЛЕНО
        updatedMod.UpdatedAt = DateTime.UtcNow;
        
        if (string.IsNullOrWhiteSpace(mod.Title))
        {
            throw new ArgumentException("Title cannot be empty");
        }
        
        if (mod.Title.Length > 100)
        {
            throw new ArgumentException("Title is too long (max 100 chars)");
        }
        
        if (mod.Description != null && mod.Description.Length > 1000)
        {
            throw new ArgumentException("Description is too long (max 1000 chars)");
        }
        
        if (versions == null || !mod.VersionIds.Any())
        {
            throw new ArgumentException("At least one version must be specified");
        }

        if (loaders == null || !mod.ModLoaderIds.Any())
        {
            throw new ArgumentException("At least one mod loader must be specified");
        }

        if (developers == null || !mod.DeveloperIds.Any())
        {
            throw new ArgumentException("At least one developer must be specified");
        }
        
        context.Mods.Update(updatedMod);
        await context.SaveChangesAsync();
        
        updatedMod = await context.Mods
            .Include(m => m.Versions)
            .Include(m => m.ModLoaders)
            .Include(m => m.Tags)
            .Include(m => m.Developers)
            .FirstOrDefaultAsync(m => m.Id == mod.Id);

        return new ModDto()
        {
            Id = updatedMod.Id,
            Title = updatedMod.Title,
            Description = updatedMod.Description,
            IsClientside = updatedMod.IsClientside,
            Downloads = updatedMod.Downloads,
            Size = updatedMod.Size,
            ImageUrl = updatedMod.ImageUrl, // ← ДОБАВЛЕНО
            Versions = updatedMod.Versions.Select(v => new ModVersionDto()
            {
                Id = v.Id,
                Title = v.Title,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.UpdatedAt
            }).ToList(),
            ModLoaders = updatedMod.ModLoaders.Select(l => new ModLoaderDto()
            {
                Id = l.Id,
                Title = l.Title,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            }).ToList(),
            Tags = updatedMod.Tags.Select(t => new TagDto()
            {
                Id = t.Id,
                Title = t.Title,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList(),
            Developers = updatedMod.Developers.Select(d => new DeveloperDto()
            {
                Id = d.Id,
                Nickname = d.Nickname,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            CreatedAt = updatedMod.CreatedAt,
            UpdatedAt = updatedMod.UpdatedAt
        };
    }

    public async Task Delete(Guid id)
    {
        Mod? mod = await context.Mods.FindAsync(id);

        if (mod == null)
        {
            throw new KeyNotFoundException($"Mod with id {id} not found");
        }
        
        context.Mods.Remove(mod);
        await context.SaveChangesAsync();
    }
}