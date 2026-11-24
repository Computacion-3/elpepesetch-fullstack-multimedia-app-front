import { Suspense } from 'react';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { PermissionsPanel } from '@/src/features/users/presentation/components/PermissionsPanel';

async function PermissionsContent() {
    await requirePermission(PERMISSIONS.PERMISSIONS_MANAGE);
    return <PermissionsPanel />;
}

export default function PermissionsPage() {
    return (
        <Suspense fallback={null}>
            <PermissionsContent />
        </Suspense>
    );
}
