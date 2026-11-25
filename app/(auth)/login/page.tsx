import { Suspense } from 'react';
import { AuthShell } from '@/src/features/auth/presentation/components/AuthShell';
import { LoginForm } from '@/src/features/auth/presentation/components/LoginForm';

export default function LoginPage() {
    return (
        <AuthShell title="Iniciar sesión" description="Retoma tu biblioteca donde la dejaste.">
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </AuthShell>
    );
}
