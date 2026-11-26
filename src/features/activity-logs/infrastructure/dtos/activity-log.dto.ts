import type { ActivityAction, ActivityMediaItem, PageMeta } from '../../domain/entities/activity-log';

export interface ActivityLogDto {
  id: string;
  action: ActivityAction;
  metadata: unknown;
  createdAt: string;
  mediaItem?: ActivityMediaItem | null;
}

export interface ActivityPaginationDto { data: ActivityLogDto[]; meta: PageMeta }

