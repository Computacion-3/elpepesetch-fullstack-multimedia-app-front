import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { UserListsView } from '@/src/features/user-lists/presentation/components/UserListsView';
import { Spinner } from '@/src/shared/ui/Spinner';

async function AuthenticatedUserLists() {
  await requireSession();
  return <UserListsView />;
}

export default function UserListsPage() {
  return (
    <Suspense
      fallback={
        <Spinner label="Cargando tus listas" size="lg" className="py-16" />
      }
    >
      <AuthenticatedUserLists />
    </Suspense>
  );
}
