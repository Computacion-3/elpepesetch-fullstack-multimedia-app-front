import { RegisterForm } from '@/src/features/auth/presentation/components/RegisterForm';

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="mx-auto w-full max-w-sm rounded-lg border border-gray-300 p-6 shadow-sm">
                <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>
                <RegisterForm />
            </div>
        </main>
    );
}
