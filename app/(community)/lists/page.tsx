import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { UserListsView } from '@/src/features/user-lists/presentation/components/UserListsView';

async function AuthenticatedUserLists() {
  await requireSession();
  return <UserListsView />;
}

export default function UserListsPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-gray-500">Cargando tus listas…</p>
      }
    >
      <AuthenticatedUserLists />
    </Suspense>
  );
}
