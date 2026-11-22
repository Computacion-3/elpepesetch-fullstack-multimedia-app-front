'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { Modal } from '@/src/shared/ui/Modal';
import { Pagination } from '@/src/shared/ui/Pagination';
import { useRoles } from '../hooks/use-roles';
import { useUsers } from '../hooks/use-users';
import type { UserViewModel } from '../viewmodels/users.viewmodel';
import { UserForm } from './UserForm';
import { UsersFilters } from './UsersFilters';
import { UsersTable } from './UsersTable';

/** Users administration panel. */
export function UsersPanel({ currentUserId }: { currentUserId: number }) {
    const { users, page, isLoading, errorMessage, load, setFilters, remove, clearError } = useUsers();
    const { roles, load: loadRoles } = useRoles();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<UserViewModel | null>(null);
    const [toDelete, setToDelete] = useState<UserViewModel | null>(null);

    useEffect(() => {
        void loadRoles();
    }, [loadRoles]);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        clearError();
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (user: UserViewModel) => {
        clearError();
        setEditing(user);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        clearError();
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        await remove(toDelete.id);
        setToDelete(null);
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Usuarios</h1>
                <Button type="button" onClick={openCreate}>
                    Nuevo usuario
                </Button>
            </div>
            {errorMessage && !formOpen && <Alert variant="error">{errorMessage}</Alert>}
            <UsersFilters />
            <UsersTable
                users={users}
                currentUserId={currentUserId}
                roles={roles}
                onEdit={openEdit}
                onDelete={setToDelete}
            />
            {isLoading && users.length === 0 && <p className="text-sm">Cargando…</p>}
            <Pagination
                page={page.page}
                totalPages={page.totalPages}
                onChange={(next) => setFilters({ page: next })}
            />
            <Modal
                open={formOpen}
                title={editing ? 'Editar usuario' : 'Nuevo usuario'}
                onClose={closeForm}
            >
                <UserForm user={editing ?? undefined} roles={roles} onDone={closeForm} />
            </Modal>
            <ConfirmDialog
                open={toDelete !== null}
                title="Eliminar usuario"
                message={
                    toDelete
                        ? `¿Eliminar a ${toDelete.username}? Esta acción no se puede deshacer.`
                        : ''
                }
                confirmLabel="Eliminar"
                loading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </section>
    );
}
