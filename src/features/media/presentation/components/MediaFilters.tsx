'use client';

import type { MediaQuery } from '../../domain/entities/media-item';
import type { ReactNode } from 'react';
import { Select } from '@/src/shared/ui/Select';
import { TextField } from '@/src/shared/ui/TextField';

type MediaFiltersProps = {
    query: MediaQuery;
    onChange: (changes: Partial<MediaQuery>) => void;
    children?: ReactNode;
};

/** Controles comunes para q, tipo, género, año, orden y página del catálogo. */
export function MediaFilters({ query, onChange, children }: MediaFiltersProps) {
    return (
        <section aria-label="Filtros del catálogo" className="grid gap-4 rounded-lg border border-gray-300 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
                id="media-search"
                label="Buscar por título o creador"
                value={query.q ?? ''}
                onChange={(event) => onChange({ q: event.target.value || undefined })}
                placeholder="Ej. Dune"
            />
            <Select
                id="media-type"
                label="Tipo"
                value={query.type ?? ''}
                onChange={(event) => onChange({ type: (event.target.value || undefined) as MediaQuery['type'] })}
                options={[
                    { value: '', label: 'Todos los tipos' },
                    { value: 'GAME', label: 'Videojuegos' },
                    { value: 'MOVIE', label: 'Películas' },
                    { value: 'BOOK', label: 'Libros' },
                ]}
            />
            {children}
            <TextField
                id="media-year"
                label="Año"
                type="number"
                min={1900}
                max={2100}
                value={query.year ?? ''}
                onChange={(event) => onChange({ year: event.target.value ? Number(event.target.value) : undefined })}
            />
            <Select
                id="media-sort"
                label="Ordenar por"
                value={query.sortBy ?? 'title'}
                onChange={(event) => onChange({ sortBy: event.target.value as MediaQuery['sortBy'] })}
                options={[
                    { value: 'title', label: 'Título' },
                    { value: 'releaseYear', label: 'Año' },
                    { value: 'averageRating', label: 'Calificación' },
                ]}
            />
            <Select
                id="media-order"
                label="Dirección"
                value={query.order ?? 'ASC'}
                onChange={(event) => onChange({ order: event.target.value as MediaQuery['order'] })}
                options={[
                    { value: 'ASC', label: 'Ascendente' },
                    { value: 'DESC', label: 'Descendente' },
                ]}
            />
        </section>
    );
}
