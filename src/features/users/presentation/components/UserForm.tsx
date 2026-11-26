'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Select } from '@/src/shared/ui/Select';
import { TextField } from '@/src/shared/ui/TextField';
import type { UserChanges } from '../../domain/entities/user-account';
import { useUsers } from '../hooks/use-users';
import type { RoleViewModel } from '../viewmodels/roles.viewmodel';
import type { UserViewModel } from '../viewmodels/users.viewmodel';

type UserFormProps = {
    user?: UserViewModel;
    roles: RoleViewModel[];
    onDone: () => void;
};

/** Create / edit user form. */
export function UserForm({ user, roles, onDone }: UserFormProps) {
    const { create, update, errorMessage, isLoading, clearError } = useUsers();
    const [username, setUsername] = useState(user?.username ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [roleId, setRoleId] = useState(user ? String(user.roleId) : '');

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let ok: boolean;
        if (!user) {
            ok = await create({
                username,
                email,
                password,
                fullName: fullName || undefined,
                bio: bio || undefined,
                roleId: Number(roleId),
            });
        } else {
            const changes: UserChanges = {};
            if (username && username !== user.username) changes.username = username;
            if (email && email !== user.email) changes.email = email;
            if (fullName && fullName !== user.fullName) changes.fullName = fullName;
            if (bio && bio !== user.bio) changes.bio = bio;
            if (roleId && Number(roleId) !== user.roleId) changes.roleId = Number(roleId);
            if (password) changes.password = password;
            if (Object.keys(changes).length === 0) {
                onDone();
                return;
            }
            ok = await update(user.id, changes);
        }
        if (ok) onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <TextField
                id="user-form-username"
                label="Usuario"
                type="text"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
                id="user-form-email"
                label="Correo electrónico"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                id="user-form-password"
                label={user ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
                id="user-form-full-name"
                label="Nombre completo"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
                id="user-form-bio"
                label="Biografía"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
            <Select
                id="user-form-role"
                label="Rol"
                value={roleId}
                options={[
                    { value: '', label: 'Selecciona un rol' },
                    ...roles.map((r) => ({ value: String(r.id), label: r.name })),
                ]}
                onChange={(e) => setRoleId(e.target.value)}
            />
            <Button type="submit" loading={isLoading}>
                {user ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
        </form>
    );
}
