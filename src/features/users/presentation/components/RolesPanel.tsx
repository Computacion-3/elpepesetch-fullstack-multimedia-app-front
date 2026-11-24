'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { Modal } from '@/src/shared/ui/Modal';
import { useRoles } from '../hooks/use-roles';
import type { RoleViewModel } from '../viewmodels/roles.viewmodel';
import { RoleForm } from './RoleForm';
import { RolePermissionsForm } from './RolePermissionsForm';

/** Roles administration panel. */
export function RolesPanel() {
    const { roles, isLoading, errorMessage, load, remove, clearSelected, clearError } = useRoles();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<RoleViewModel | null>(null);
    const [permissionsRole, setPermissionsRole] = useState<RoleViewModel | null>(null);
    const [toDelete, setToDelete] = useState<RoleViewModel | null>(null);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        clearError();
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (role: RoleViewModel) => {
        clearError();
        setEditing(role);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        clearError();
    };

    const closePermissions = () => {
        setPermissionsRole(null);
        clearSelected();
        clearError();
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Roles</h1>
                <Button type="button" onClick={openCreate}>
                    Nuevo rol
                </Button>
            </div>
            {errorMessage && !formOpen && !permissionsRole && (
                <Alert variant="error">{errorMessage}</Alert>
            )}
            <table className="w-full text-left text-sm">
                <thead>
                    <tr>
                        <th className="py-2">Nombre</th>
                        <th className="py-2">Descripción</th>
                        <th className="py-2">Permisos</th>
                        <th className="py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role.id} className="border-t">
                            <td className="py-2">{role.name}</td>
                            <td className="py-2">{role.description}</td>
                            <td className="py-2">{role.permissionCount}</td>
                            <td className="flex gap-2 py-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    aria-label={`Editar ${role.name}`}
                                    onClick={() => openEdit(role)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    aria-label={`Permisos de ${role.name}`}
                                    onClick={() => {
                                        clearError();
                                        setPermissionsRole(role);
                                    }}
                                >
                                    Permisos
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    aria-label={`Eliminar ${role.name}`}
                                    onClick={() => setToDelete(role)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {roles.length === 0 && !isLoading && (
                        <tr>
                            <td colSpan={4} className="py-4 text-center">
                                No hay roles
                            </td>
                        </tr>
                    )}
                    {roles.length === 0 && isLoading && (
                        <tr>
                            <td colSpan={4} className="py-4 text-center">
                                Cargando…
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Modal open={formOpen} title={editing ? 'Editar rol' : 'Nuevo rol'} onClose={closeForm}>
                <RoleForm role={editing ?? undefined} onDone={closeForm} />
            </Modal>
            <Modal
                open={permissionsRole !== null}
                title={`Permisos de ${permissionsRole?.name ?? ''}`}
                onClose={closePermissions}
            >
                {permissionsRole && (
                    <RolePermissionsForm roleId={permissionsRole.id} onDone={closePermissions} />
                )}
            </Modal>
            <ConfirmDialog
                open={toDelete !== null}
                title="Eliminar rol"
                message={`¿Eliminar el rol ${toDelete?.name ?? ''}?`}
                confirmLabel="Eliminar"
                loading={isLoading}
                onConfirm={async () => {
                    if (!toDelete) return;
                    await remove(toDelete.id);
                    setToDelete(null);
                }}
                onCancel={() => setToDelete(null)}
            />
        </section>
    );
}
