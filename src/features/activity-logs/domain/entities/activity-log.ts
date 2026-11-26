import type { MediaItemProps } from '@/src/features/media/domain/entities/media-item';

export const ACTIVITY_ACTIONS = [
  'ENTRY_ADDED', 'STATUS_CHANGED', 'PROGRESS_UPDATED', 'ENTRY_COMPLETED',
  'FAVORITE_TOGGLED', 'REVIEW_CREATED', 'LIST_CREATED',
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number] | (string & {});
export type ActivityMediaItem = Pick<MediaItemProps,
  'id' | 'title' | 'type' | 'coverUrl' | 'releaseYear' | 'creator' | 'pages' |
  'durationMinutes' | 'platform' | 'averageRating' | 'ratingsCount' | 'genres'>;

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  mediaItem: ActivityMediaItem | null;
}

export interface PageMeta { total: number; page: number; limit: number; totalPages: number }
export interface Paginated<T> { data: T[]; meta: PageMeta }
export interface ActivityQuery { page: number; limit: number }

