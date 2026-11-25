import type { ReviewMediaType } from '../../domain/entities/review';

/** Representación DTO de un autor de reseña devuelta por la API REST. */
export interface ReviewAuthorDto {
    id: number;
    username?: string;
    fullName?: string | null;
}

/** Representación DTO mínima del elemento multimedia asociado a una reseña. */
export interface ReviewMediaDto {
    id: string;
    title?: string;
    type?: ReviewMediaType;
    creator?: string;
    releaseYear?: number;
}

/** Elemento multimedia devuelto por el catálogo (`GET /media` o `GET /media-item`). */
export interface CatalogMediaDto {
    id: string;
    title: string;
    type: ReviewMediaType;
    creator?: string | null;
    releaseYear?: number | null;
    approvalStatus?: string;
}

/** Respuesta paginada del catálogo (`GET /media`). */
export interface PaginatedCatalogMediaDto {
    data: CatalogMediaDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/** DTO de una reseña devuelta por `GET /media/:mediaItemId/reviews`, `POST` o `PATCH`. */
export interface ReviewDto {
    id: string;
    title: string | null;
    content: string;
    isHidden: boolean;
    hiddenReason: string | null;
    createdAt: string;
    updatedAt: string;
    user?: ReviewAuthorDto;
    mediaItem?: ReviewMediaDto;
}

/** Respuesta paginada estándar del endpoint `GET /media/:mediaItemId/reviews`. */
export interface PaginatedReviewsDto {
    data: ReviewDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/** Cuerpo JSON enviado a `POST /media/:mediaItemId/reviews`. */
export interface CreateReviewRequestDto {
    title?: string;
    content: string;
}

/** Cuerpo JSON enviado a `PATCH /reviews/:id`. */
export interface UpdateReviewRequestDto {
    title?: string;
    content?: string;
}
