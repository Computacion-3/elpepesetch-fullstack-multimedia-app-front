import { ValidationError } from '@/src/shared/domain/errors';

/** Tipos multimedia que el catálogo admite según los DTOs del backend. */
export type MediaType = 'GAME' | 'MOVIE' | 'BOOK';

/** Estados de moderación que devuelve el catálogo. */
export type MediaApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Referencia ligera a un género; evita que el dominio dependa del módulo genres. */
export interface MediaGenreReference {
    id: string;
    name: string;
}

/** Autor de la propuesta, incluido por el backend en detalle y pendientes. */
export interface MediaAuthor {
    id: number;
    username: string;
}

/** Datos completos que usa el dominio para representar un elemento multimedia. */
export interface MediaItemProps {
    id: string;
    title: string;
    type: MediaType;
    description: string | null;
    releaseYear: number;
    creator: string;
    coverUrl: string | null;
    platform: string | null;
    durationMinutes: number | null;
    pages: number | null;
    isbn: string | null;
    approvalStatus: MediaApprovalStatus;
    rejectionReason: string | null;
    averageRating: number;
    ratingsCount: number;
    genres: MediaGenreReference[];
    createdBy?: MediaAuthor;
    createdAt?: string;
    updatedAt?: string;
}

/** Campos obligatorios al crear una propuesta; los campos específicos dependen del tipo. */
export interface MediaItemDraft {
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

/** Una edición solo valida y envía las propiedades que realmente se modificaron. */
export type MediaItemChanges = Partial<MediaItemDraft>;

/** Filtros que soporta el catálogo y la cola de moderación. */
export interface MediaQuery {
    q?: string;
    type?: MediaType;
    genreId?: string;
    year?: number;
    sortBy?: 'title' | 'releaseYear' | 'averageRating';
    order?: 'ASC' | 'DESC';
    page: number;
    limit: number;
}

/** Decisión del moderador; el motivo solo aplica a los rechazos. */
export interface MediaApprovalDraft {
    approvalStatus: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

const MEDIA_TYPES: readonly MediaType[] = ['GAME', 'MOVIE', 'BOOK'];
const MEDIA_TITLE_MAX_LENGTH = 150;
const MEDIA_CREATOR_MAX_LENGTH = 120;
const MEDIA_GENRE_MIN_COUNT = 1;

/** Revisa las reglas de creación definidas por los DTOs y el servicio del backend. */
export function assertValidMediaDraft(draft: MediaItemDraft): void {
    assertValidMediaChanges(draft);

    if (!draft.title?.trim()) throw new ValidationError('El título es obligatorio');
    if (!draft.type || !MEDIA_TYPES.includes(draft.type)) {
        throw new ValidationError('Selecciona un tipo multimedia válido');
    }
    if (!Number.isInteger(draft.releaseYear) || draft.releaseYear < 1900 || draft.releaseYear > 2100) {
        throw new ValidationError('El año debe ser un número entero entre 1900 y 2100');
    }
    if (!draft.creator?.trim()) throw new ValidationError('El creador es obligatorio');
    if (!draft.genreIds || draft.genreIds.length < MEDIA_GENRE_MIN_COUNT) {
        throw new ValidationError('Selecciona al menos un género');
    }
    if (new Set(draft.genreIds).size !== draft.genreIds.length) {
        throw new ValidationError('No repitas géneros en la propuesta');
    }
}

/** Valida únicamente propiedades presentes, como lo hace UpdateMediaItemDto. */
export function assertValidMediaChanges(changes: MediaItemChanges): void {
    if (changes.title !== undefined && (!changes.title.trim() || changes.title.length > MEDIA_TITLE_MAX_LENGTH)) {
        throw new ValidationError(`El título es obligatorio y no puede superar ${MEDIA_TITLE_MAX_LENGTH} caracteres`);
    }
    if (changes.type !== undefined && !MEDIA_TYPES.includes(changes.type)) {
        throw new ValidationError('Selecciona un tipo multimedia válido');
    }
    if (changes.releaseYear !== undefined &&
        (!Number.isInteger(changes.releaseYear) || changes.releaseYear < 1900 || changes.releaseYear > 2100)) {
        throw new ValidationError('El año debe ser un número entero entre 1900 y 2100');
    }
    if (changes.creator !== undefined &&
        (!changes.creator.trim() || changes.creator.length > MEDIA_CREATOR_MAX_LENGTH)) {
        throw new ValidationError(`El creador es obligatorio y no puede superar ${MEDIA_CREATOR_MAX_LENGTH} caracteres`);
    }
    if (changes.coverUrl !== undefined && changes.coverUrl !== '') {
        try {
            new URL(changes.coverUrl);
        } catch {
            throw new ValidationError('La URL de portada no es válida');
        }
        if (changes.coverUrl.length > 500) throw new ValidationError('La URL de portada no puede superar 500 caracteres');
    }
    if (changes.platform !== undefined && changes.platform.length > 60) {
        throw new ValidationError('La plataforma no puede superar 60 caracteres');
    }
    if (changes.durationMinutes !== undefined &&
        (!Number.isInteger(changes.durationMinutes) || changes.durationMinutes < 1)) {
        throw new ValidationError('La duración debe ser un número entero mayor que cero');
    }
    if (changes.pages !== undefined && (!Number.isInteger(changes.pages) || changes.pages < 1)) {
        throw new ValidationError('Las páginas deben ser un número entero mayor que cero');
    }
    if (changes.isbn !== undefined && changes.isbn.length > 20) {
        throw new ValidationError('El ISBN no puede superar 20 caracteres');
    }
    if (changes.genreIds !== undefined) {
        if (changes.genreIds.length < MEDIA_GENRE_MIN_COUNT) {
            throw new ValidationError('Selecciona al menos un género');
        }
        if (new Set(changes.genreIds).size !== changes.genreIds.length) {
            throw new ValidationError('No repitas géneros en la propuesta');
        }
    }
}

/** La entidad agrupa el resultado validado que entrega el repositorio. */
export class MediaItem {
    constructor(readonly props: MediaItemProps) {}
}

/** Rechazar exige un motivo no vacío de hasta 255 caracteres, según el backend. */
export function assertValidMediaApproval(draft: MediaApprovalDraft): void {
    if (draft.approvalStatus === 'REJECTED') {
        const reason = draft.rejectionReason?.trim() ?? '';
        if (!reason) throw new ValidationError('Escribe un motivo para rechazar el elemento');
        if (reason.length > 255) throw new ValidationError('El motivo no puede superar 255 caracteres');
    }
}
