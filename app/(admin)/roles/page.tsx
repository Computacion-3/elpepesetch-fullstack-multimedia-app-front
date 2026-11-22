import { Suspense } from 'react';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { RolesPanel } from '@/src/features/users/presentation/components/RolesPanel';

async function RolesContent() {
    await requirePermission(PERMISSIONS.ROLES_MANAGE);
    return <RolesPanel />;
}

export default function RolesPage() {
    return (
        <Suspense fallback={null}>
            <RolesContent />
        </Suspense>
    );
}
