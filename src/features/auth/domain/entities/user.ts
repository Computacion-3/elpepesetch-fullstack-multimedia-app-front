import {
    assertValidEmail,
    assertValidFullName,
    assertValidPassword,
    assertValidUsername,
} from '@/src/shared/domain/account-rules';
import { ValidationError } from '@/src/shared/domain/errors';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterDraft {
    username: string;
    email: string;
    password: string;
    fullName?: string;
}

/** Login rules: valid email and a non-empty password. */
export function assertValidLoginCredentials(credentials: LoginCredentials): void {
    assertValidEmail(credentials.email ?? '');
    if (!credentials.password) {
        throw new ValidationError('Ingresa tu contraseña');
    }
}

/** Register rules, mirroring the backend. The first failing rule throws. */
export function assertValidRegisterDraft(draft: RegisterDraft): void {
    assertValidUsername(draft.username ?? '');
    assertValidEmail(draft.email ?? '');
    assertValidPassword(draft.password ?? '');
    if (draft.fullName !== undefined) {
        assertValidFullName(draft.fullName);
    }
}

export class User {
    constructor(
        readonly id: number,
        readonly username: string,
        readonly email: string,
        readonly fullName: string | null,
        readonly role: string,
        readonly permissions: readonly string[],
    ) {}

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }
}
