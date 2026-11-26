import { Suspense } from 'react';
import { ProfileScreen } from '@/src/features/auth/presentation/components/ProfileScreen';
import { requireSession } from '@/src/lib/dal';
import { Spinner } from '@/src/shared/ui/Spinner';

/** Exige sesión en el servidor; los datos del perfil salen del store (useAuth). */
async function ProfileGate() {
    await requireSession();
    return <ProfileScreen />;
}

export default function ProfilePage() {
    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
            <Suspense fallback={<Spinner label="Cargando tu perfil" size="lg" className="py-20" />}>
                <ProfileGate />
            </Suspense>
        </main>
    );
}
