import type { Genre } from '../../domain/entities/genre';

/** Forma serializable que usan las tarjetas, selects y formularios de géneros. */
export interface GenreViewModel {
    id: string;
    name: string;
    description: string | null;
}

/** Convierte entidades en objetos planos antes de cruzar la Server Action. */
export class GenreViewModelMapper {
    static toViewModel(genre: Genre): GenreViewModel {
        return { id: genre.id, name: genre.name, description: genre.description };
    }
}
