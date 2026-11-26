'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { Modal } from '@/src/shared/ui/Modal';
import { usePermissions } from '../hooks/use-permissions';
import type { PermissionViewModel } from '../viewmodels/permissions.viewmodel';
import { PermissionForm } from './PermissionForm';
import { Spinner } from '@/src/shared/ui/Spinner';

/** Permissions admin panel: list, create, edit and delete. */
export function PermissionsPanel() {
    const { permissions, isLoading, errorMessage, load, remove, clearError } = usePermissions();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<PermissionViewModel | null>(null);
    const [toDelete, setToDelete] = useState<PermissionViewModel | null>(null);

    useEffect(() => {
        void load();
    }, [load]);

    const openNew = () => {
        clearError();
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (permission: PermissionViewModel) => {
        clearError();
        setEditing(permission);
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
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">Permisos</h1>
                <Button type="button" onClick={openNew}>
                    Nuevo permiso
                </Button>
            </div>
            {errorMessage && !formOpen && <Alert variant="error">{errorMessage}</Alert>}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
                <table className="w-full min-w-[38rem] text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
                            <th className="px-3 py-2">Nombre</th>
                            <th className="px-3 py-2">Descripción</th>
                            <th className="px-3 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.map((permission) => (
                            <tr
                                key={permission.id}
                                className="border-b border-white/10 last:border-b-0 hover:bg-white/5"
                            >
                                <td className="px-3 py-3">{permission.name}</td>
                                <td className="px-3 py-3 text-muted">{permission.description}</td>
                                <td className="px-3 py-2">
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            aria-label={`Editar ${permission.name}`}
                                            onClick={() => openEdit(permission)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            aria-label={`Eliminar ${permission.name}`}
                                            onClick={() => setToDelete(permission)}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {permissions.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-3 py-8 text-center text-muted">
                                    {isLoading ? <Spinner label="Cargando permisos" /> : 'No hay permisos'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Modal
                open={formOpen}
                title={editing ? 'Editar permiso' : 'Nuevo permiso'}
                onClose={closeForm}
            >
                <PermissionForm permission={editing ?? undefined} onDone={closeForm} />
            </Modal>
            <ConfirmDialog
                open={toDelete !== null}
                title="Eliminar permiso"
                message={`¿Eliminar el permiso ${toDelete?.name ?? ''}?`}
                confirmLabel="Eliminar"
                loading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </section>
    );
}
