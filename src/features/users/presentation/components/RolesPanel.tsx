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
import { Spinner } from '@/src/shared/ui/Spinner';

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
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Roles</h1>
                <Button type="button" onClick={openCreate}>
                    Nuevo rol
                </Button>
            </div>
            {errorMessage && !formOpen && !permissionsRole && (
                <Alert variant="error">{errorMessage}</Alert>
            )}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
                <table className="w-full min-w-[44rem] text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
                            <th className="px-3 py-2">Nombre</th>
                            <th className="px-3 py-2">Descripción</th>
                            <th className="px-3 py-2">Permisos</th>
                            <th className="px-3 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr
                                key={role.id}
                                className="border-t border-white/10 hover:bg-white/5"
                            >
                                <td className="px-3 py-3">{role.name}</td>
                                <td className="px-3 py-3 text-muted">{role.description}</td>
                                <td className="px-3 py-3">{role.permissionCount}</td>
                                <td className="px-3 py-2">
                                    <div className="flex flex-wrap gap-2">
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
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {roles.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                                    {isLoading ? <Spinner label="Cargando roles" /> : 'No hay roles'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
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
