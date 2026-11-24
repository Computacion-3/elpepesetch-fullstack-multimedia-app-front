import { ValidationError } from '@/src/shared/domain/errors';

export interface PermissionDraft {
    name: string;
    description: string;
}

/** Permission rules, mirroring the backend. The first failing rule throws. */
export function assertValidPermissionDraft(draft: PermissionDraft): void {
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

export class Permission {
    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
    ) {}
}
