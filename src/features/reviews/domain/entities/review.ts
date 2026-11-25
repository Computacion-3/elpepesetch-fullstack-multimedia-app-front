import { ValidationError } from '@/src/shared/domain/errors';

/** Longitud máxima permitida para el título opcional de una reseña. */
export const REVIEW_TITLE_MAX_LENGTH = 100;
/** Longitud mínima requerida para el contenido de una reseña. */
export const REVIEW_CONTENT_MIN_LENGTH = 10;
/** Longitud máxima permitida para el contenido de una reseña. */
export const REVIEW_CONTENT_MAX_LENGTH = 2000;

/** Tipos de elementos multimedia soportados por el catálogo. */
export type ReviewMediaType = 'GAME' | 'MOVIE' | 'BOOK';

/** Opción resumida de elemento multimedia para seleccionar sobre qué título reseñar. */
export interface ReviewMediaOption {
    readonly id: string;
    readonly title: string;
    readonly type: ReviewMediaType;
    readonly creator: string;
    readonly releaseYear: number;
}

/** Datos requeridos para publicar una nueva reseña sobre un elemento multimedia. */
export interface ReviewDraft {
    title?: string;
    content: string;
}

/** Campos editables de una reseña existente. */
export type ReviewChanges = Partial<ReviewDraft>;

/** Parámetros de consulta paginada de reseñas por elemento multimedia. */
export interface ReviewListQuery {
    mediaItemId: string;
    page: number;
    limit: number;
}

/** Valida el título opcional de la reseña respetando la invariante del backend (máx. 100 caracteres). */
export function assertValidReviewTitle(title: string): void {
    if (title.trim().length > REVIEW_TITLE_MAX_LENGTH) {
        throw new ValidationError(`El título no puede superar ${REVIEW_TITLE_MAX_LENGTH} caracteres`);
    }
}

/** Valida el contenido obligatorio de la reseña (entre 10 y 2000 caracteres útiles). */
export function assertValidReviewContent(content: string): void {
    const normalized = content.trim();
    if (normalized.length < REVIEW_CONTENT_MIN_LENGTH) {
        throw new ValidationError(
            `El contenido de la reseña debe tener al menos ${REVIEW_CONTENT_MIN_LENGTH} caracteres`,
        );
    }
    if (normalized.length > REVIEW_CONTENT_MAX_LENGTH) {
        throw new ValidationError(
            `El contenido de la reseña no puede superar ${REVIEW_CONTENT_MAX_LENGTH} caracteres`,
        );
    }
}

/** Valida todas las reglas de negocio previas a crear una reseña. */
export function assertValidReviewDraft(mediaItemId: string, draft: ReviewDraft): void {
    if (!mediaItemId.trim()) {
        throw new ValidationError('Selecciona un elemento multimedia para reseñar');
    }
    if (draft.title !== undefined) {
        assertValidReviewTitle(draft.title);
    }
    assertValidReviewContent(draft.content ?? '');
}

/** Valida los campos presentes al actualizar una reseña existente. */
export function assertValidReviewChanges(changes: ReviewChanges): void {
    if (changes.title !== undefined) {
        assertValidReviewTitle(changes.title);
    }
    if (changes.content !== undefined) {
        assertValidReviewContent(changes.content);
    }
    if (changes.title === undefined && changes.content === undefined) {
        throw new ValidationError('Debes modificar al menos el título o el contenido');
    }
}

/**
 * Entidad de dominio que representa una reseña de comunidad sobre un elemento multimedia.
 * Encapsula reglas de autorización sobre edición, eliminación y reporte.
 */
export class Review {
    constructor(
        readonly id: string,
        readonly mediaItemId: string,
        readonly mediaTitle: string,
        readonly mediaType: ReviewMediaType,
        readonly authorId: number,
        readonly authorUsername: string,
        readonly authorFullName: string | null,
        readonly title: string | null,
        readonly content: string,
        readonly isHidden: boolean,
        readonly hiddenReason: string | null,
        readonly createdAt: string,
        readonly updatedAt: string,
    ) {}

    /** Indica si el usuario dado es el autor o administrador, único habilitado para editar/eliminar. */
    canBeManagedBy(userId: number, role: string): boolean {
        return this.authorId === userId || role === 'ADMIN';
    }

    /** Indica si el usuario dado puede reportar la reseña (no se permite reportar reseñas propias). */
    canBeReportedBy(userId: number): boolean {
        return this.authorId !== userId;
    }
}
