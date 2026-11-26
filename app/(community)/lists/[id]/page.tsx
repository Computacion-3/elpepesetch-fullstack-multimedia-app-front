import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { UserListDetail } from '@/src/features/user-lists/presentation/components/UserListDetail';

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
      fallback={<p className="p-6 text-sm text-gray-500">Cargando lista…</p>}
    >
      <AuthenticatedUserList params={params} />
    </Suspense>
  );
}
