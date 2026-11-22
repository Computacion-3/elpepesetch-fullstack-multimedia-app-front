'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { Modal } from '@/src/shared/ui/Modal';
import { usePermissions } from '../hooks/use-permissions';
import type { PermissionViewModel } from '../viewmodels/permissions.viewmodel';
import { PermissionForm } from './PermissionForm';

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
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Permisos</h1>
                <Button type="button" onClick={openNew}>
                    Nuevo permiso
                </Button>
            </div>
            {errorMessage && !formOpen && <Alert variant="error">{errorMessage}</Alert>}
            <table className="w-full text-left text-sm">
                <thead>
                    <tr>
                        <th className="py-2">Nombre</th>
                        <th className="py-2">Descripción</th>
                        <th className="py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.map((permission) => (
                        <tr key={permission.id}>
                            <td className="py-2">{permission.name}</td>
                            <td className="py-2">{permission.description}</td>
                            <td className="flex gap-2 py-2">
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
                            </td>
                        </tr>
                    ))}
                    {permissions.length === 0 && (
                        <tr>
                            <td colSpan={3} className="py-4 text-center">
                                {isLoading ? 'Cargando…' : 'No hay permisos'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
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
