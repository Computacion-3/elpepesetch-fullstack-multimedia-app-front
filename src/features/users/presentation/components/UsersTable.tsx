'use client';

import { Button } from '@/src/shared/ui/Button';
import { useUsers } from '../hooks/use-users';
import type { RoleViewModel } from '../viewmodels/roles.viewmodel';
import type { UserViewModel } from '../viewmodels/users.viewmodel';

type UsersTableProps = {
    users: UserViewModel[];
    currentUserId: number;
    roles: RoleViewModel[];
    onEdit: (user: UserViewModel) => void;
    onDelete: (user: UserViewModel) => void;
};

/** Users table with inline role assignment and status toggle. */
export function UsersTable({ users, currentUserId, roles, onEdit, onDelete }: UsersTableProps) {
    const { assignRole, setStatus } = useUsers();

    return (
        <table className="w-full text-left text-sm">
            <thead>
                <tr className="border-b">
                    <th className="px-2 py-2">Usuario</th>
                    <th className="px-2 py-2">Correo</th>
                    <th className="px-2 py-2">Rol</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.length === 0 && (
                    <tr className="border-b">
                        <td colSpan={5} className="px-2 py-2">
                            No hay usuarios
                        </td>
                    </tr>
                )}
                {users.map((user) => {
                    const isSelf = user.id === currentUserId;
                    return (
                        <tr key={user.id} className="border-b">
                            <td className="px-2 py-2">
                                <div>{user.username}</div>
                                {user.fullName && (
                                    <div className="text-xs text-gray-500">{user.fullName}</div>
                                )}
                            </td>
                            <td className="px-2 py-2">{user.email}</td>
                            <td className="px-2 py-2">
                                {roles.length > 0 ? (
                                    <select
                                        aria-label={`Rol de ${user.username}`}
                                        value={String(user.roleId)}
                                        onChange={(e) => void assignRole(user.id, Number(e.target.value))}
                                        className="rounded-md border border-gray-400 px-2 py-1 text-sm"
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={String(role.id)}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    user.roleName
                                )}
                            </td>
                            <td className="px-2 py-2">{user.isActive ? 'Activo' : 'Inactivo'}</td>
                            <td className="px-2 py-2">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        aria-label={`Editar ${user.username}`}
                                        onClick={() => onEdit(user)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        aria-label={`${user.isActive ? 'Desactivar' : 'Activar'} ${user.username}`}
                                        disabled={isSelf}
                                        onClick={() => void setStatus(user.id, !user.isActive)}
                                    >
                                        {user.isActive ? 'Desactivar' : 'Activar'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        aria-label={`Eliminar ${user.username}`}
                                        disabled={isSelf}
                                        onClick={() => onDelete(user)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
