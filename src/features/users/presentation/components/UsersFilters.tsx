'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/src/shared/ui/Button';
import { Select } from '@/src/shared/ui/Select';
import { TextField } from '@/src/shared/ui/TextField';
import { useRoles } from '../hooks/use-roles';
import { useUsers } from '../hooks/use-users';

/** Search, role and status filters for the users list. */
export function UsersFilters() {
    const { filters, setFilters } = useUsers();
    const { roles } = useRoles();
    const [q, setQ] = useState(filters.q ?? '');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFilters({ q: q.trim() || undefined });
    };

    const statusValue = filters.isActive === undefined ? '' : String(filters.isActive);

    return (
        <div className="flex flex-wrap items-end gap-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <TextField
                    id="users-filter-q"
                    label="Buscar"
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <Button type="submit" variant="secondary">
                    Buscar
                </Button>
            </form>
            <Select
                id="users-filter-role"
                label="Rol"
                value={filters.role ?? ''}
                disabled={roles.length === 0}
                options={[
                    { value: '', label: 'Todos' },
                    ...roles.map((r) => ({ value: r.name, label: r.name })),
                ]}
                onChange={(e) => setFilters({ role: e.target.value || undefined })}
            />
            <Select
                id="users-filter-status"
                label="Estado"
                value={statusValue}
                options={[
                    { value: '', label: 'Todos' },
                    { value: 'true', label: 'Activos' },
                    { value: 'false', label: 'Inactivos' },
                ]}
                onChange={(e) =>
                    setFilters({ isActive: e.target.value === '' ? undefined : e.target.value === 'true' })
                }
            />
        </div>
    );
}
