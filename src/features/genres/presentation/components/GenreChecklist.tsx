'use client';

import { useGenres } from '../hooks/use-genres';
import { Alert } from '@/src/shared/ui/Alert';
import { Spinner } from '@/src/shared/ui/Spinner';

/** Selector múltiple de géneros; el formulario dueño controla los identificadores elegidos. */
export function GenreChecklist({ selectedIds, onToggle }: { selectedIds: string[]; onToggle: (id: string) => void }) {
    const genres = useGenres();

    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Géneros (selecciona al menos uno)</legend>
            {genres.errorMessage && <Alert variant="error">{genres.errorMessage}</Alert>}
            {genres.isLoading && <Spinner label="Cargando géneros" size="sm" className="justify-start py-2" />}
            {!genres.isLoading && genres.items.length === 0 && <p className="text-sm text-muted">Aún no hay géneros disponibles.</p>}
            {genres.items.map((genre) => (
                <label key={genre.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10">
                    <input className="accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" type="checkbox" checked={selectedIds.includes(genre.id)} onChange={() => onToggle(genre.id)} />
                    {genre.name}
                </label>
            ))}
        </fieldset>
    );
}
