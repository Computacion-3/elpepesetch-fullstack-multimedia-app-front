'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { usePermissions } from '../hooks/use-permissions';
import { useRoles } from '../hooks/use-roles';

/** Assigns permissions to a role. */
export function RolePermissionsForm({ roleId, onDone }: { roleId: number; onDone: () => void }) {
    const { selectedRole, loadRole, setPermissions, errorMessage, isLoading, clearError } =
        useRoles();
    const { permissions, load: loadPermissions } = usePermissions();
    const [overrides, setOverrides] = useState<number[] | null>(null);

    useEffect(() => {
        clearError();
        void loadRole(roleId);
        void loadPermissions();
    }, [roleId, clearError, loadRole, loadPermissions]);

    const currentRole = selectedRole?.id === roleId ? selectedRole : null;
    const checkedIds = overrides ?? currentRole?.permissionIds ?? [];

    const toggle = (id: number) => {
        setOverrides(
            checkedIds.includes(id) ? checkedIds.filter((item) => item !== id) : [...checkedIds, id],
        );
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ok = await setPermissions(roleId, checkedIds);
        if (ok) onDone();
    };

    if (!currentRole) {
        return (
            <div className="flex flex-col gap-4">
                {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
                <p className="text-sm text-gray-600">Cargando permisos…</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto">
                {permissions.map((permission) => (
                    <li key={permission.id} className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id={`role-permission-${permission.id}`}
                            className="mt-1"
                            checked={checkedIds.includes(permission.id)}
                            onChange={() => toggle(permission.id)}
                        />
                        <label htmlFor={`role-permission-${permission.id}`} className="flex flex-col">
                            <span className="font-bold">{permission.name}</span>
                            <span className="text-xs text-gray-500">{permission.description}</span>
                        </label>
                    </li>
                ))}
            </ul>
            <Button type="submit" loading={isLoading}>
                Guardar permisos
            </Button>
        </form>
    );
}
