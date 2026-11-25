'use client';

import { useGenres } from '../hooks/use-genres';
import { Select } from '@/src/shared/ui/Select';

/** Control de filtro que mantiene la carga de géneros dentro de su módulo. */
export function GenreFilter({ value, onChange }: { value: string; onChange: (id: string) => void }) {
    const genres = useGenres();

    return (
        <Select
            id="media-genre"
            label="Género"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            options={[
                { value: '', label: genres.isLoading ? 'Cargando géneros…' : 'Todos los géneros' },
                ...genres.items.map((genre) => ({ value: genre.id, label: genre.name })),
            ]}
        />
    );
}
