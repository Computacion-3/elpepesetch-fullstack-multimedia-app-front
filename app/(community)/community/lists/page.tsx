import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { PublicListsView } from '@/src/features/user-lists/presentation/components/PublicListsView';

async function AuthenticatedPublicLists() {
  await requireSession();
  return <PublicListsView />;
}

export default function PublicListsPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-gray-500">Cargando listas públicas…</p>
      }
    >
      <AuthenticatedPublicLists />
    </Suspense>
  );
}
