'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { TextField } from '@/src/shared/ui/TextField';
import { useAuth } from '../hooks/use-auth';

/** Registration form. */
export function RegisterForm() {
    const router = useRouter();
    const { register, isLoading, errorMessage, clearError } = useAuth();
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ok = await register({
            username,
            email,
            password,
            fullName: fullName || undefined,
        });
        if (ok) router.replace('/login?registered=1');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <TextField
                id="username"
                label="Usuario"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
                id="fullName"
                label="Nombre completo (opcional)"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
                id="email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                id="password"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" loading={isLoading}>
                Crear cuenta
            </Button>
            <Link href="/login" className="text-sm text-brand hover:underline">
                ¿Ya tienes cuenta? Inicia sesión
            </Link>
        </form>
    );
}
