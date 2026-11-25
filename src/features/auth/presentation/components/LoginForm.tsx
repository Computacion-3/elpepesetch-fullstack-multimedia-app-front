'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { TextField } from '@/src/shared/ui/TextField';
import { useAuth } from '../hooks/use-auth';

/** Login form. */
export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isLoading, errorMessage, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (await login({ email, password })) {
            router.replace('/');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {searchParams.get('registered') === '1' && (
                <Alert variant="success">Cuenta creada. Ya puedes iniciar sesión.</Alert>
            )}
            {searchParams.get('reason') === 'account-deactivated' && (
                <Alert variant="error">Tu cuenta fue desactivada. Contacta con un administrador si crees que es un error.</Alert>
            )}
            {searchParams.get('reason') === 'session-ended' && (
                <Alert variant="success">Tu sesión se cerró. Inicia sesión para continuar.</Alert>
            )}
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" loading={isLoading}>
                Iniciar sesión
            </Button>
            <Link href="/register" className="text-sm text-brand hover:underline">
                ¿No tienes cuenta? Regístrate
            </Link>
        </form>
    );
}
