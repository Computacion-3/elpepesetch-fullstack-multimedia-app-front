'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { TextField } from '@/src/shared/ui/TextField';
import { usePermissions } from '../hooks/use-permissions';
import type { PermissionViewModel } from '../viewmodels/permissions.viewmodel';

type PermissionFormProps = {
    permission?: PermissionViewModel;
    onDone: () => void;
};

/** Create / edit permission form. */
export function PermissionForm({ permission, onDone }: PermissionFormProps) {
    const { create, update, errorMessage, isLoading, clearError } = usePermissions();
    const [name, setName] = useState(permission?.name ?? '');
    const [description, setDescription] = useState(permission?.description ?? '');

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ok = permission
            ? await update(permission.id, { name, description })
            : await create({ name, description });
        if (ok) onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <TextField
                id="permission-form-name"
                label="Nombre"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                id="permission-form-description"
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" loading={isLoading}>
                {permission ? 'Guardar cambios' : 'Crear permiso'}
            </Button>
        </form>
    );
}
