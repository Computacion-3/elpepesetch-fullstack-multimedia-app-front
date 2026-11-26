import { LibraryView } from '@/src/features/library/presentation/components/LibraryView';
import { requireSession } from '@/src/lib/dal';
import { Suspense } from 'react';

/** Comprueba la sesión en tiempo de solicitud, fuera del shell estático. */
async function AuthenticatedLibrary() {
  await requireSession();
  return <LibraryView />;
}

/** Muestra la biblioteca cuando termina la validación de sesión. */
export default function LibraryPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Cargando biblioteca...</p>}>
      <AuthenticatedLibrary />
    </Suspense>
  );
}
