import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { __Feature__ } from '../../domain/entities/__feature-kebab__';
import type { Create__Feature__Params, __Feature__Repository } from '../../domain/repositories/__feature-kebab__.repository';
import type { __Feature__Datasource } from '../datasources/__feature-kebab__.datasource';
import { __Feature__Mapper } from '../mappers/__feature-kebab__.mapper';

export class __Feature__RepositoryImpl implements __Feature__Repository {
    constructor(private readonly datasource: __Feature__Datasource) { }

    async getAll(): Promise<__Feature__[]> {
        try {
            const dtos = await this.datasource.fetchAll();
            return dtos.map((dto) => __Feature__Mapper.toDomain(dto));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async getById(id: string): Promise<__Feature__ | null> {
        try {
            const dto = await this.datasource.fetchById(id);
            return dto ? __Feature__Mapper.toDomain(dto) : null;
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async create(params: Create__Feature__Params): Promise<__Feature__> {
        try {
            const dto = await this.datasource.create(__Feature__Mapper.toCreateDto(params));
            return __Feature__Mapper.toDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }
}
