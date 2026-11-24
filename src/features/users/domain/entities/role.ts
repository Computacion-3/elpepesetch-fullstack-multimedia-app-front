import { ValidationError } from '@/src/shared/domain/errors';

import type { Permission } from './permission';

export interface RoleDraft {
    name: string;
    description: string;
}

/** Role rules, mirroring the backend. The first failing rule throws. */
export function assertValidRoleDraft(draft: RoleDraft): void {
    const name = (draft.name ?? '').trim();
    if (!name) {
        throw new ValidationError('El nombre es obligatorio');
    }
    if (name.length > 50) {
        throw new ValidationError('El nombre no puede superar 50 caracteres');
    }
    if ((draft.description ?? '').length > 255) {
        throw new ValidationError('La descripción no puede superar 255 caracteres');
    }
}

export class Role {
    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
        readonly permissions: readonly Permission[],
        readonly permissionCount: number,
    ) {}
}
