import { Suspense } from 'react';
import { LoginForm } from '@/src/features/auth/presentation/components/LoginForm';

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="mx-auto w-full max-w-sm rounded-lg border border-gray-300 p-6 shadow-sm">
                <h1 className="mb-4 text-xl font-semibold">Iniciar sesión</h1>
                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}
