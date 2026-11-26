import type { ActivityLog, Paginated } from '../../domain/entities/activity-log';

export interface ActivityLogViewModel extends ActivityLog {
  description: string;
  context: string | null;
  dateLabel: string;
  mediaHref: string | null;
}
export interface ActivityPaginationViewModel { data: ActivityLogViewModel[]; meta: Paginated<ActivityLog>['meta'] }

const text = (value: unknown): string | null => typeof value === 'string' || typeof value === 'number' ? String(value) : null;

export const ActivityLogViewModelMapper = {
  toViewModel(activity: ActivityLog): ActivityLogViewModel {
    const metadata = activity.metadata;
    let description = 'Realizaste una actividad.';
    let context: string | null = null;
    switch (activity.action) {
      case 'ENTRY_ADDED': description = 'Agregaste un medio a tu biblioteca.'; break;
      case 'STATUS_CHANGED': description = 'Cambiaste el estado de un medio.'; context = [text(metadata?.previousStatus), text(metadata?.status)].every(Boolean) ? `${metadata?.previousStatus} → ${metadata?.status}` : null; break;
      case 'ENTRY_COMPLETED': description = 'Completaste un medio.'; context = [text(metadata?.previousStatus), text(metadata?.status)].every(Boolean) ? `${metadata?.previousStatus} → ${metadata?.status}` : null; break;
      case 'PROGRESS_UPDATED': description = 'Actualizaste el progreso de un medio.'; context = [text(metadata?.previousProgress), text(metadata?.progress)].every(Boolean) ? `${metadata?.previousProgress} → ${metadata?.progress}` : null; break;
      case 'FAVORITE_TOGGLED': description = metadata?.isFavorite === true ? 'Marcaste un medio como favorito.' : metadata?.isFavorite === false ? 'Quitaste un medio de tus favoritos.' : 'Actualizaste un favorito.'; break;
      case 'REVIEW_CREATED': description = 'Creaste una reseña.'; break;
      case 'LIST_CREATED': description = 'Creaste una lista.'; break;
    }
    const parsedDate = new Date(activity.createdAt);
    return {
      ...activity,
      description,
      context,
      dateLabel: Number.isNaN(parsedDate.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate),
      mediaHref: activity.mediaItem ? `/catalog/${encodeURIComponent(activity.mediaItem.id)}` : null,
    };
  },
  toPaginatedViewModel(page: Paginated<ActivityLog>): ActivityPaginationViewModel {
    return { data: page.data.map(ActivityLogViewModelMapper.toViewModel), meta: page.meta };
  },
};
