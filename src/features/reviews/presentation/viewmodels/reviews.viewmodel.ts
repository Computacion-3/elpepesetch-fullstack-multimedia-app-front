import type { Review, ReviewMediaOption, ReviewMediaType } from '../../domain/entities/review';

const MEDIA_TYPE_LABELS: Record<ReviewMediaType, string> = {
    GAME: 'Juego',
    MOVIE: 'Película',
    BOOK: 'Libro',
};

/** Opción serializable del catálogo multimedia lista para renderizar en selectores. */
export interface ReviewMediaOptionViewModel {
    id: string;
    title: string;
    type: ReviewMediaType;
    typeLabel: string;
    creator: string;
    releaseYear: number;
    label: string;
}

/** Modelo de vista plano y serializable de una reseña para los componentes UI. */
export interface ReviewViewModel {
    id: string;
    mediaItemId: string;
    mediaTitle: string;
    mediaTypeLabel: string;
    authorId: number;
    authorUsername: string;
    authorDisplayName: string;
    title: string;
    content: string;
    isHidden: boolean;
    hiddenReason: string | null;
    createdAtIso: string;
    formattedCreatedAt: string;
    formattedUpdatedAt: string;
}

/** Página serializable de reseñas para almacenamiento en Redux y renderizado. */
export interface ReviewsPageViewModel {
    items: ReviewViewModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

function formatDateEs(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsed);
}

/**
 * Transformador de entidades de dominio `Review` y `ReviewMediaOption` hacia ViewModels.
 */
export class ReviewsViewModelMapper {
    static toMediaOption(option: ReviewMediaOption): ReviewMediaOptionViewModel {
        const typeLabel = MEDIA_TYPE_LABELS[option.type] ?? option.type;
        const yearSuffix = option.releaseYear > 0 ? ` (${option.releaseYear})` : '';
        return {
            id: option.id,
            title: option.title,
            type: option.type,
            typeLabel,
            creator: option.creator,
            releaseYear: option.releaseYear,
            label: `${option.title}${yearSuffix} · ${typeLabel}`,
        };
    }

    static toViewModel(review: Review): ReviewViewModel {
        return {
            id: review.id,
            mediaItemId: review.mediaItemId,
            mediaTitle: review.mediaTitle,
            mediaTypeLabel: MEDIA_TYPE_LABELS[review.mediaType] ?? review.mediaType,
            authorId: review.authorId,
            authorUsername: review.authorUsername,
            authorDisplayName: review.authorFullName?.trim() || review.authorUsername,
            title: review.title ?? '',
            content: review.content,
            isHidden: review.isHidden,
            hiddenReason: review.hiddenReason,
            createdAtIso: review.createdAt,
            formattedCreatedAt: formatDateEs(review.createdAt),
            formattedUpdatedAt: formatDateEs(review.updatedAt),
        };
    }

    /** Acepta estructuralmente `Page<Review>` sin importar `shared-domain` desde ViewModels. */
    static toPage(
        page: Omit<ReviewsPageViewModel, 'items'> & { items: Review[] },
    ): ReviewsPageViewModel {
        return {
            items: page.items.map((item) => ReviewsViewModelMapper.toViewModel(item)),
            total: page.total,
            page: page.page,
            limit: page.limit,
            totalPages: page.totalPages,
        };
    }
}
