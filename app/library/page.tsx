import { LibraryView } from '@/src/features/library/presentation/components/LibraryView';
import { requireSession } from '@/src/lib/dal';
import { Suspense } from 'react';
import { Spinner } from '@/src/shared/ui/Spinner';

/** Comprueba la sesión en tiempo de solicitud, fuera del shell estático. */
async function AuthenticatedLibrary() {
  await requireSession();
  return <LibraryView />;
}

/** Muestra la biblioteca cuando termina la validación de sesión. */
export default function LibraryPage() {
  return (
    <Suspense fallback={<Spinner label="Cargando biblioteca" size="lg" className="py-16" />}>
      <AuthenticatedLibrary />
    </Suspense>
  );
}
