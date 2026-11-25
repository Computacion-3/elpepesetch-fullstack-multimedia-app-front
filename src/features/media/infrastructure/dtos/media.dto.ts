import type { MediaApprovalStatus, MediaType } from '../../domain/entities/media-item';

/** Género anidado en la respuesta de media. */
export interface MediaGenreDto {
    id: string;
    name: string;
    description?: string | null;
}

/** Autor anidado en detalles y propuestas pendientes. */
export interface MediaAuthorDto {
    id: number;
    username: string;
}

/** Forma de lectura que REST y el contrato GraphQL deben devolver. */
export interface MediaItemDto {
    id: string;
    title: string;
    type: MediaType;
    description?: string | null;
    releaseYear: number;
    creator: string;
    coverUrl?: string | null;
    platform?: string | null;
    durationMinutes?: number | null;
    pages?: number | null;
    isbn?: string | null;
    approvalStatus: MediaApprovalStatus;
    rejectionReason?: string | null;
    averageRating?: number | string;
    ratingsCount?: number;
    genres?: MediaGenreDto[];
    createdBy?: MediaAuthorDto;
    createdAt?: string;
    updatedAt?: string;
}

/** Paginación REST del catálogo multimedia. */
export interface PaginatedMediaDto {
    data: MediaItemDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Payload REST/GraphQL de creación de una propuesta. */
export interface CreateMediaItemDto {
    title: string;
    type: MediaType;
    description?: string;
    releaseYear: number;
    creator: string;
    coverUrl?: string;
    platform?: string;
    durationMinutes?: number;
    pages?: number;
    isbn?: string;
    genreIds: string[];
}

/** DTO parcial de actualización. */
export type UpdateMediaItemDto = Partial<CreateMediaItemDto>;

/** Payload de aprobación o rechazo del moderador. */
export interface MediaApprovalDto {
    approvalStatus: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

/** Filtros compartidos por catálogo y cola pendiente. */
export interface MediaQueryDto {
    q?: string;
    type?: MediaType;
    genreId?: string;
    year?: number;
    sortBy?: 'title' | 'releaseYear' | 'averageRating';
    order?: 'ASC' | 'DESC';
    page: number;
    limit: number;
}
