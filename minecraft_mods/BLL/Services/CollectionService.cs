﻿using BLL.Interfaces;
using DAL.Interfaces;
using DTO.Collection;
using DTO.Shared;

namespace BLL.Services;

public class CollectionService(IRepository<CollectionDto, CreateCollectionDto, UpdateCollectionDto> repository) : IService<CollectionDto, CreateCollectionDto, UpdateCollectionDto>
{
        public async Task<List<CollectionDto>> GetAll() => await repository.GetAll();
        public async Task<QueryParamsDto<CollectionDto>> GetByPage(QueryParamsDto<CollectionDto> queryParams) => await repository.GetByPage(queryParams);
        public async Task<CollectionDto> GetById(Guid id) => await repository.GetById(id);
        public async Task<CollectionDto> Create(CreateCollectionDto collection) => await repository.Create(collection);
        public async Task<CollectionDto> Update(UpdateCollectionDto collection) => await repository.Update(collection);
        public async Task Delete(Guid id) => await repository.Delete(id);
}