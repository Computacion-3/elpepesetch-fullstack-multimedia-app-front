import { ValidationError } from '@/src/shared/domain/errors';

/** Género disponible para clasificar elementos multimedia. */
export class Genre {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly description: string | null,
    ) {}
}

/** Campos obligatorios al crear un género. */
export interface GenreDraft {
    name: string;
    description?: string;
}

/** Campos opcionales que puede actualizar la administración. */
export type GenreChanges = Partial<GenreDraft>;

/** Valida el DTO de creación: nombre requerido y límites del backend. */
export function assertValidGenreDraft(draft: GenreDraft): void {
    assertValidGenreChanges(draft);
    if (!draft.name?.trim()) throw new ValidationError('El nombre del género es obligatorio');
}

/** Valida solo los valores presentes durante una edición parcial. */
export function assertValidGenreChanges(changes: GenreChanges): void {
    if (changes.name !== undefined && (!changes.name.trim() || changes.name.length > 50)) {
        throw new ValidationError('El nombre es obligatorio y no puede superar 50 caracteres');
    }
    if (changes.description !== undefined && changes.description.length > 255) {
        throw new ValidationError('La descripción no puede superar 255 caracteres');
    }
}
