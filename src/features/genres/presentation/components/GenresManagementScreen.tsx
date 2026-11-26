'use client';

import { useState } from 'react';
import type { GenreChanges, GenreDraft } from '../../domain/entities/genre';
import type { GenreViewModel } from '../viewmodels/genre.viewmodel';
import { useGenres } from '../hooks/use-genres';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { GenreForm } from './GenreForm';

/** Pantalla administrativa para CRUD de géneros y presentación de conflictos del backend. */
export function GenresManagementScreen() {
    const genres = useGenres();
    const [editing, setEditing] = useState<GenreViewModel | null>(null);
    const [deleting, setDeleting] = useState<GenreViewModel | null>(null);

    async function save(values: GenreDraft | GenreChanges): Promise<boolean> {
        if (editing) return genres.update(editing.id, values);
        return genres.create(values as GenreDraft);
    }

    async function confirmDelete() {
        if (!deleting) return;
        const succeeded = await genres.remove(deleting.id);
        if (succeeded) setDeleting(null);
    }

    return (
        <section className="space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">Administración</p>
                <h1 className="text-3xl font-bold">Gestión de géneros</h1>
                <p className="mt-2 text-gray-600">Organiza los géneros usados en el catálogo y en las propuestas.</p>
            </header>
            {genres.errorMessage && <Alert variant="error">{genres.errorMessage}</Alert>}
            <GenreForm
                key={editing?.id ?? 'new-genre'}
                genre={editing}
                loading={genres.isMutating}
                onSave={save}
                onCancel={() => setEditing(null)}
            />
            {genres.isLoading && <p role="status">Cargando géneros…</p>}
            {genres.status === 'succeeded' && genres.items.length === 0 && <p>Aún no hay géneros creados.</p>}
            <ul className="divide-y divide-gray-300 rounded-lg border border-gray-300">
                {[...genres.items].sort((a, b) => a.name.localeCompare(b.name)).map((genre) => (
                    <li key={genre.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                        <div>
                            <h2 className="font-semibold">{genre.name}</h2>
                            <p className="text-sm text-gray-600">{genre.description || 'Sin descripción.'}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setEditing(genre)}>Editar</Button>
                            <Button variant="secondary" onClick={() => setDeleting(genre)}>Eliminar</Button>
                        </div>
                    </li>
                ))}
            </ul>
            <Button variant="secondary" onClick={() => void genres.reload()}>Actualizar géneros</Button>
            <ConfirmDialog
                open={deleting !== null}
                title="Eliminar género"
                message={deleting ? `¿Eliminar “${deleting.name}”? Si está asignado a contenido, el servidor rechazará la operación.` : ''}
                confirmLabel="Eliminar"
                loading={genres.isMutating}
                onConfirm={() => void confirmDelete()}
                onCancel={() => setDeleting(null)}
            />
        </section>
    );
}
