import { Suspense } from 'react';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { UsersPanel } from '@/src/features/users/presentation/components/UsersPanel';

async function UsersContent() {
    const { user } = await requirePermission(PERMISSIONS.USERS_MANAGE);
    return <UsersPanel currentUserId={user.id} />;
}

export default function UsersPage() {
    return (
        <Suspense fallback={null}>
            <UsersContent />
        </Suspense>
    );
}
