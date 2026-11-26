import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { PublicListsView } from '@/src/features/user-lists/presentation/components/PublicListsView';
import { Spinner } from '@/src/shared/ui/Spinner';

async function AuthenticatedPublicLists() {
  await requireSession();
  return <PublicListsView />;
}

export default function PublicListsPage() {
  return (
    <Suspense
      fallback={
        <Spinner label="Cargando listas públicas" size="lg" className="py-16" />
      }
    >
      <AuthenticatedPublicLists />
    </Suspense>
  );
}
