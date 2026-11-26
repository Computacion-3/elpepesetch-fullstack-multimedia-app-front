import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { UserListDetail } from '@/src/features/user-lists/presentation/components/UserListDetail';
import { Spinner } from '@/src/shared/ui/Spinner';

async function AuthenticatedUserList({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  return <UserListDetail id={id} ownerId={session.user.id} />;
}

export default function UserListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<Spinner label="Cargando lista" size="lg" className="py-16" />}
    >
      <AuthenticatedUserList params={params} />
    </Suspense>
  );
}
