import type { ActivityLog, Paginated } from '../../domain/entities/activity-log';
import type { ActivityLogDto, ActivityPaginationDto } from '../dtos/activity-log.dto';

function mapMetadata(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export const ActivityLogMapper = {
  toDomain(dto: ActivityLogDto): ActivityLog {
    return { id: dto.id, action: dto.action, metadata: mapMetadata(dto.metadata), createdAt: dto.createdAt, mediaItem: dto.mediaItem ?? null };
  },
  toPaginatedDomain(dto: ActivityPaginationDto): Paginated<ActivityLog> {
    return { data: dto.data.map(ActivityLogMapper.toDomain), meta: dto.meta };
  },
};
