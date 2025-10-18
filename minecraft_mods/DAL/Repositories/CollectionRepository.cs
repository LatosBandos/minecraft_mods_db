using DAL.EF;
using DAL.Entities;
using DAL.Interfaces;
using DTO.Collection;
using DTO.Difficulty;
using DTO.Focus;
using DTO.Mod;
using DTO.ModLoader;
using DTO.ModVersion;
using DTO.Shared;
using System.Linq.Dynamic.Core;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories;

public class CollectionRepository(ApplicationContext context) : IRepository<CollectionDto, CreateCollectionDto, UpdateCollectionDto>
{
    public async Task<List<CollectionDto>> GetAll()
    {
        List<Collection> collections = await context.Collections
            .Include(c => c.Mods)
            .Include(c => c.Focuses)
            .Include(c => c.Version)
            .Include(c => c.ModLoader)
            .Include(c => c.Difficulty)
            .ToListAsync();

        return collections.Select(collection => new CollectionDto()
        {
            Id = collection.Id,
            Name = collection.Name,
            TimeToComplete = collection.TimeToComplete,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            Mods = collection.Mods.Select(m => new ModForCollectionDto()
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IsClientside = m.IsClientside,
                Downloads = m.Downloads,
                Size = m.Size,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            }).ToList(),
            Focuses = collection.Focuses.Select(f => new FocusDto()
            {
                Id = f.Id,
                Name = f.Name,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
            }).ToList(),
            Version = new ModVersionDto()
            {
                Id = collection.Version.Id,
                Title = collection.Version.Title,
                CreatedAt = collection.Version.CreatedAt,
                UpdatedAt = collection.Version.UpdatedAt
            },
            ModLoader = new ModLoaderDto()
            {
                Id = collection.ModLoader.Id,
                Title = collection.ModLoader.Title,
                CreatedAt = collection.ModLoader.CreatedAt,
                UpdatedAt = collection.ModLoader.UpdatedAt
            },
            Difficulty = new DifficultyDto()
            {
                Id = collection.Difficulty.Id,
                Title = collection.Difficulty.Title,
                CreatedAt = collection.Difficulty.CreatedAt,
                UpdatedAt = collection.Difficulty.UpdatedAt
            }
        }).ToList();
    }


    public async Task<QueryParamsDto<CollectionDto>> GetByPage(QueryParamsDto<CollectionDto> queryParams)
    {
        var totalCount = await context.Collections.CountAsync();
        string sorting = $"{queryParams.SortBy} {(queryParams.OrderBy?.ToLower() == "desc" ? "descending" : "ascending")}";


        var collections = context.Collections
            .Include(m => m.Mods)
            .Include(m => m.Focuses)
            .Include(c => c.Version)
            .Include(c => c.ModLoader)
            .Include(c => c.Difficulty)
            .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .AsQueryable();
        
        
        if (queryParams.Search != string.Empty)
        {
            collections = collections
                .Where(c =>
                    c.Name.ToLower().Contains(queryParams.Search.ToLower())
                );
        }
        if (queryParams.FocusIds.Any())
        {
            collections = collections
                .Where(m => m.Focuses.Any(f => queryParams.FocusIds.Contains(f.Id)));
        }
        if (queryParams.VersionIds.Any())
        {
            collections = collections
                .Where(c => queryParams.VersionIds.Contains(c.Version.Id));
        }
        if (queryParams.ModLoaderIds.Any())
        {
            collections = collections
                .Where(c => queryParams.ModLoaderIds.Contains(c.ModLoader.Id));
        }
        if (queryParams.DifficultyIds.Any())
        {
            collections = collections
                .Where(c => queryParams.DifficultyIds.Contains(c.Difficulty.Id));
        }
        
        
        var items = collections
            .OrderBy(sorting)
            .Select(c => new CollectionDto()
        {
            Id = c.Id,
            Name = c.Name,
            TimeToComplete = c.TimeToComplete,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            Mods = c.Mods.Select(m => new ModForCollectionDto()
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IsClientside = m.IsClientside,
                Downloads = m.Downloads,
                Size = m.Size,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            }).ToList(),
            Focuses = c.Focuses.Select(f => new FocusDto()
            {
                Id = f.Id,
                Name = f.Name,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            }).ToList(),
            Version = new ModVersionDto()
            {
                Id = c.Version.Id,
                Title = c.Version.Title,
                CreatedAt = c.Version.CreatedAt,
                UpdatedAt = c.Version.UpdatedAt
            },
            ModLoader = new ModLoaderDto()
            {
                Id = c.ModLoader.Id,
                Title = c.ModLoader.Title,
                CreatedAt = c.ModLoader.CreatedAt,
                UpdatedAt = c.ModLoader.UpdatedAt
            },
            Difficulty = new DifficultyDto()
            {
                Id = c.Difficulty.Id,
                Title = c.Difficulty.Title,
                CreatedAt = c.Difficulty.CreatedAt,
                UpdatedAt = c.Difficulty.UpdatedAt
            }
        }).ToList();


        return new QueryParamsDto<CollectionDto>()
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = queryParams.PageNumber,
            PageSize = queryParams.PageSize
        };
    }


    public async Task<CollectionDto> GetById(Guid id)
    {
        Collection? collection = await context.Collections
            .Include(c => c.Mods)
            .Include(c => c.Focuses)
            .Include(c => c.Version)
            .Include(c => c.ModLoader)
            .Include(c => c.Difficulty)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        
        if (collection == null)
        {
            throw new KeyNotFoundException($"Collection with id {id} not found");
        }
        
        
        return new CollectionDto()
        {
            Id = collection.Id,
            Name = collection.Name,
            TimeToComplete = collection.TimeToComplete,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            Mods = collection.Mods.Select(m => new ModForCollectionDto()
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IsClientside = m.IsClientside,
                Downloads = m.Downloads,
                Size = m.Size,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            }).ToList(),
            Focuses = collection.Focuses.Select(f => new FocusDto()
            {
                Id = f.Id,
                Name = f.Name,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            }).ToList(),
            Version = new ModVersionDto()
            {
                Id = collection.Version.Id,
                Title = collection.Version.Title,
                CreatedAt = collection.Version.CreatedAt,
                UpdatedAt = collection.Version.UpdatedAt
            },
            ModLoader = new ModLoaderDto()
            {
                Id = collection.ModLoader.Id,
                Title = collection.ModLoader.Title,
                CreatedAt = collection.ModLoader.CreatedAt,
                UpdatedAt = collection.ModLoader.UpdatedAt
            },
            Difficulty = new DifficultyDto()
            {
                Id = collection.Difficulty.Id,
                Title = collection.Difficulty.Title,
                CreatedAt = collection.Difficulty.CreatedAt,
                UpdatedAt = collection.Difficulty.UpdatedAt
            }
        };
    }

    
    public async Task<CollectionDto> Create(CreateCollectionDto collection)
    {
        var mods = await context.Mods
            .Where(m => collection.ModsIds.Contains(m.Id))
            .ToListAsync();
        
        
        var focuses = await context.Focuses
            .Where(f => collection.FocusesIds.Contains(f.Id))
            .ToListAsync();
        
        
        var version = await context.ModVersions.FindAsync(collection.VersionId);
        var modLoader = await context.ModLoaders.FindAsync(collection.ModLoaderId);
        var difficulty = await context.Difficulties.FindAsync(collection.DifficultyId);
        
        
        if (string.IsNullOrWhiteSpace(collection.Name))
        {
            throw new ArgumentException("Name cannot be empty");
        }
        
        if (collection.Name.Length > 100)
        {
            throw new ArgumentException("Name is too long (max 100 chars)");
        }
        
        if (collection.ModsIds == null || !collection.ModsIds.Any())
        {
            throw new ArgumentException("At least one mod must be specified");
        }

        if (collection.FocusesIds == null || !collection.FocusesIds.Any())
        {
            throw new ArgumentException("At least one focus must be specified");
        }

        if (collection.VersionId == null)
        {
            throw new ArgumentException("At least one version must be specified");
        }
        
        if (collection.ModLoaderId == null)
        {
            throw new ArgumentException("At least one mod loader must be specified");
        }
        
        
        Collection createdCollection = new()
        {
            Name = collection.Name,
            TimeToComplete = collection.TimeToComplete,
            Mods = mods,
            Focuses = focuses,
            Version = version,
            ModLoader = modLoader,
            Difficulty = difficulty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        
        context.Collections.Add(createdCollection);
        await context.SaveChangesAsync();

        
        return new CollectionDto()
        {
            Id = createdCollection.Id,
            Name = createdCollection.Name,
            TimeToComplete = createdCollection.TimeToComplete,
            CreatedAt = createdCollection.CreatedAt,
            UpdatedAt = createdCollection.UpdatedAt,
            Mods = createdCollection.Mods.Select(m => new ModForCollectionDto()
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IsClientside = m.IsClientside,
                Downloads = m.Downloads,
                Size = m.Size,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            }).ToList(),
            Focuses = createdCollection.Focuses.Select(f => new FocusDto()
            {
                Id = f.Id,
                Name = f.Name,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            }).ToList(),
            Version = new ModVersionDto()
            {
                Id = createdCollection.Version.Id,
                Title = createdCollection.Version.Title,
                CreatedAt = createdCollection.Version.CreatedAt,
                UpdatedAt = createdCollection.Version.UpdatedAt
            },
            ModLoader = new ModLoaderDto()
            {
                Id = createdCollection.ModLoader.Id,
                Title = createdCollection.ModLoader.Title,
                CreatedAt = createdCollection.ModLoader.CreatedAt,
                UpdatedAt = createdCollection.ModLoader.UpdatedAt
            },
            Difficulty = new DifficultyDto()
            {
                Id = createdCollection.Difficulty.Id,
                Title = createdCollection.Difficulty.Title,
                CreatedAt = createdCollection.Difficulty.CreatedAt,
                UpdatedAt = createdCollection.Difficulty.UpdatedAt
            }
        };
    }

    
    public async Task<CollectionDto> Update(UpdateCollectionDto collection)
    {
        Collection? updatedCollection = await context.Collections
            .Include(c => c.Mods)
            .Include(c => c.Focuses)
            .Include(c => c.Version)
            .Include(c => c.ModLoader)
            .Include(c => c.Difficulty)
            .FirstOrDefaultAsync(c => c.Id == collection.Id);

        
        if (updatedCollection == null)
        {
            throw new KeyNotFoundException($"Mod with id {collection.Id} not found");
        }
        
        
        var mods = await context.Mods
            .Where(m => collection.ModsIds.Contains(m.Id))
            .ToListAsync();
        
        
        var focuses = await context.Focuses
            .Where(f => collection.FocusesIds.Contains(f.Id))
            .ToListAsync();
        
        
        var version = await context.ModVersions.FindAsync(collection.VersionId);
        var modLoader = await context.ModLoaders.FindAsync(collection.ModLoaderId);
        var difficulty = await context.Difficulties.FindAsync(collection.DifficultyId);
        
        
        updatedCollection.Name = collection.Name;
        updatedCollection.TimeToComplete = collection.TimeToComplete;
        updatedCollection.Mods = mods;
        updatedCollection.Focuses = focuses;
        updatedCollection.Version = version;
        updatedCollection.ModLoader = modLoader;
        updatedCollection.Difficulty = difficulty;
        updatedCollection.UpdatedAt = DateTime.UtcNow;
        
        
        if (string.IsNullOrWhiteSpace(collection.Name))
        {
            throw new ArgumentException("Name cannot be empty");
        }
        
        if (collection.Name.Length > 100)
        {
            throw new ArgumentException("Name is too long (max 100 chars)");
        }
        
        if (collection.ModsIds == null || !collection.ModsIds.Any())
        {
            throw new ArgumentException("At least one mod must be specified");
        }

        if (collection.FocusesIds == null || !collection.FocusesIds.Any())
        {
            throw new ArgumentException("At least one focus must be specified");
        }

        if (collection.VersionId == null)
        {
            throw new ArgumentException("At least one version must be specified");
        }
        
        if (collection.ModLoaderId == null)
        {
            throw new ArgumentException("At least one mod loader must be specified");
        }
      
        
        context.Collections.Update(updatedCollection);
        await context.SaveChangesAsync();

        
        return new CollectionDto()
        {
            Id = updatedCollection.Id,
            Name = updatedCollection.Name,
            TimeToComplete = updatedCollection.TimeToComplete,
            CreatedAt = updatedCollection.CreatedAt,
            UpdatedAt = updatedCollection.UpdatedAt,
            Mods = updatedCollection.Mods.Select(m => new ModForCollectionDto()
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IsClientside = m.IsClientside,
                Downloads = m.Downloads,
                Size = m.Size,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            }).ToList(),
            Focuses = updatedCollection.Focuses.Select(f => new FocusDto()
            {
                Id = f.Id,
                Name = f.Name,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            }).ToList(),
            Version = new ModVersionDto()
            {
                Id = updatedCollection.Version.Id,
                Title = updatedCollection.Version.Title,
                CreatedAt = updatedCollection.Version.CreatedAt,
                UpdatedAt = updatedCollection.Version.UpdatedAt
            },
            ModLoader = new ModLoaderDto()
            {
                Id = updatedCollection.ModLoader.Id,
                Title = updatedCollection.ModLoader.Title,
                CreatedAt = updatedCollection.ModLoader.CreatedAt,
                UpdatedAt = updatedCollection.ModLoader.UpdatedAt
            },
            Difficulty = new DifficultyDto()
            {
                Id = updatedCollection.Difficulty.Id,
                Title = updatedCollection.Difficulty.Title,
                CreatedAt = updatedCollection.Difficulty.CreatedAt,
                UpdatedAt = updatedCollection.Difficulty.UpdatedAt
            }
        };
    }

    
    public async Task Delete(Guid id)
    {
        Collection? collection = await context.Collections.FindAsync(id);
        
        if (collection == null)
        {
            throw new KeyNotFoundException($"Mod with id {id} not found");
        }
        
        context.Collections.Remove(collection);
        await context.SaveChangesAsync();
    }
}