import type { MediaItem, MediaQuery } from '../../domain/entities/media-item';
import type { Page } from '@/src/shared/domain/page';

/** Vista serializable que puede cruzar Server Actions y guardarse en Redux. */
export interface MediaItemViewModel {
    id: string;
    title: string;
    type: 'GAME' | 'MOVIE' | 'BOOK';
    description: string | null;
    releaseYear: number;
    creator: string;
    coverUrl: string | null;
    platform: string | null;
    durationMinutes: number | null;
    pages: number | null;
    isbn: string | null;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    averageRating: number;
    ratingsCount: number;
    genres: { id: string; name: string }[];
    createdBy?: { id: number; username: string };
    createdAt?: string;
    updatedAt?: string;
}

/** Metadatos de paginación con elementos ya adaptados para la UI. */
export type MediaPageViewModel = Page<MediaItemViewModel>;

/** Consulta serializable que usa el estado de filtros del catálogo. */
export type MediaQueryViewModel = MediaQuery;

/** Mapea la entidad a datos planos; evita serializar instancias de dominio en Redux. */
export class MediaViewModelMapper {
    static toViewModel(item: MediaItem): MediaItemViewModel {
        return { ...item.props, genres: item.props.genres.map((genre) => ({ ...genre })) };
    }

    static toPage(page: Page<MediaItem>): MediaPageViewModel {
        return { ...page, items: page.items.map(MediaViewModelMapper.toViewModel) };
    }
}
