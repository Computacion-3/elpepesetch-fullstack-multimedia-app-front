'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { TextField } from '@/src/shared/ui/TextField';
import { useRoles } from '../hooks/use-roles';
import type { RoleViewModel } from '../viewmodels/roles.viewmodel';

/** Create / edit role form. */
export function RoleForm({ role, onDone }: { role?: RoleViewModel; onDone: () => void }) {
    const { create, update, errorMessage, isLoading, clearError } = useRoles();
    const [name, setName] = useState(role?.name ?? '');
    const [description, setDescription] = useState(role?.description ?? '');

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ok = role
            ? await update(role.id, { name, description })
            : await create({ name, description });
        if (ok) onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <TextField
                id="role-form-name"
                label="Nombre"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                id="role-form-description"
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" loading={isLoading}>
                {role ? 'Guardar cambios' : 'Crear rol'}
            </Button>
        </form>
    );
}
