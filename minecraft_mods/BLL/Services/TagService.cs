﻿using BLL.Interfaces;
using DAL.Interfaces;
using DTO.Shared;
using DTO.Tag;
namespace BLL.Services;


public class TagService(IRepository<TagDto, CreateTagDto, UpdateTagDto> repository) : IService<TagDto, CreateTagDto, UpdateTagDto>
{
    public async Task<List<TagDto>> GetAll() => await repository.GetAll();
    public async Task<QueryParamsDto<TagDto>> GetByPage(QueryParamsDto<TagDto> queryParams) => await repository.GetByPage(queryParams);
    public async Task<TagDto> GetById(Guid id) => await repository.GetById(id);
    public async Task<TagDto> Create(CreateTagDto tag) => await repository.Create(tag);
    public async Task<TagDto> Update(UpdateTagDto tag) => await repository.Update(tag);
    public async Task Delete(Guid id) => await repository.Delete(id);
}