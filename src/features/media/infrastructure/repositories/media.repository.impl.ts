import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { Page } from '@/src/shared/domain/page';
import type { MediaApprovalDraft, MediaItem, MediaItemChanges, MediaItemDraft, MediaQuery } from '../../domain/entities/media-item';
import type { MediaRepository } from '../../domain/repositories/media.repository';
import type { MediaDatasource } from '../datasources/media.datasource';
import { MediaMapper } from '../mappers/media.mapper';

/** Traduce transporte y errores a la forma estable del dominio. */
export class MediaRepositoryImpl implements MediaRepository {
    constructor(private readonly datasource: MediaDatasource) {}

    async list(token: string, query: MediaQuery): Promise<Page<MediaItem>> {
        try {
            return MediaMapper.toPage(await this.datasource.fetchAll(token, MediaMapper.toQueryDto(query)));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async listPending(token: string, query: MediaQuery): Promise<Page<MediaItem>> {
        try {
            return MediaMapper.toPage(await this.datasource.fetchPending(token, MediaMapper.toQueryDto(query)));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async getById(token: string, id: string): Promise<MediaItem> {
        try {
            return MediaMapper.toDomain(await this.datasource.fetchById(token, id));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async create(token: string, draft: MediaItemDraft): Promise<MediaItem> {
        try {
            return MediaMapper.toDomain(await this.datasource.create(token, MediaMapper.toCreateDto(draft)));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async update(token: string, id: string, changes: MediaItemChanges): Promise<MediaItem> {
        try {
            return MediaMapper.toDomain(await this.datasource.update(token, id, MediaMapper.toUpdateDto(changes)));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async setApproval(token: string, id: string, draft: MediaApprovalDraft): Promise<MediaItem> {
        try {
            return MediaMapper.toDomain(await this.datasource.setApproval(token, id, MediaMapper.toApprovalDto(draft)));
        } catch (error) {
            throw toDomainError(error);
        }
    }
}
