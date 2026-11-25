'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { GenreChanges, GenreDraft } from '../../domain/entities/genre';
import type { GenreViewModel } from '../viewmodels/genre.viewmodel';
import { Button } from '@/src/shared/ui/Button';
import { TextField } from '@/src/shared/ui/TextField';

type GenreFormProps = {
    genre?: GenreViewModel | null;
    loading: boolean;
    onSave: (values: GenreDraft | GenreChanges) => Promise<boolean>;
    onCancel: () => void;
};

/** Formulario reutilizable para crear y editar géneros, con límites del DTO. */
export function GenreForm({ genre, loading, onSave, onCancel }: GenreFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        setName(genre?.name ?? '');
        setDescription(genre?.description ?? '');
    }, [genre]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const succeeded = await onSave({ name, description: description || undefined });
        if (succeeded) onCancel();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-300 p-5">
            <h2 className="text-lg font-semibold">{genre ? 'Editar género' : 'Crear género'}</h2>
            <TextField id="genre-name" label="Nombre" required maxLength={50} value={name} onChange={(event) => setName(event.target.value)} />
            <div className="flex flex-col gap-1">
                <label htmlFor="genre-description" className="text-sm font-medium">Descripción (opcional)</label>
                <textarea id="genre-description" rows={3} maxLength={255} value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-md border border-gray-400 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand" />
            </div>
            <div className="flex gap-2">
                <Button type="submit" loading={loading}>{genre ? 'Guardar' : 'Crear género'}</Button>
                {genre && <Button variant="secondary" onClick={onCancel}>Cancelar edición</Button>}
            </div>
        </form>
    );
}
