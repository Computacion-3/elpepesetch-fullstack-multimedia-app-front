import { AuthShell } from '@/src/features/auth/presentation/components/AuthShell';
import { RegisterForm } from '@/src/features/auth/presentation/components/RegisterForm';

export default function RegisterPage() {
    return (
        <AuthShell
            title="Crear cuenta"
            description="Lleva la cuenta de lo que terminas, lo que tienes pendiente y lo que abandonaste."
        >
            <RegisterForm />
        </AuthShell>
    );
}
