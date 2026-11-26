/** Forma serializada de un género que comparten REST y el contrato GraphQL. */
export interface GenreDto {
    id: string;
    name: string;
    description?: string | null;
}

/** Datos admitidos al crear un género. */
export interface CreateGenreDto {
    name: string;
    description?: string;
}

/** Cambios parciales de un género existente. */
export type UpdateGenreDto = Partial<CreateGenreDto>;
