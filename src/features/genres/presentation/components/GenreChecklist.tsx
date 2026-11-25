'use client';

import { useGenres } from '../hooks/use-genres';
import { Alert } from '@/src/shared/ui/Alert';

/** Selector múltiple de géneros; el formulario dueño controla los identificadores elegidos. */
export function GenreChecklist({ selectedIds, onToggle }: { selectedIds: string[]; onToggle: (id: string) => void }) {
    const genres = useGenres();

    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Géneros (selecciona al menos uno)</legend>
            {genres.errorMessage && <Alert variant="error">{genres.errorMessage}</Alert>}
            {genres.isLoading && <p role="status" className="text-sm">Cargando géneros…</p>}
            {!genres.isLoading && genres.items.length === 0 && <p className="text-sm text-gray-600">Aún no hay géneros disponibles.</p>}
            {genres.items.map((genre) => (
                <label key={genre.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedIds.includes(genre.id)} onChange={() => onToggle(genre.id)} />
                    {genre.name}
                </label>
            ))}
        </fieldset>
    );
}
