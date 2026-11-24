import {
    assertValidEmail,
    assertValidFullName,
    assertValidPassword,
    assertValidUsername,
} from '@/src/shared/domain/account-rules';
import { ValidationError } from '@/src/shared/domain/errors';

const BIO_MAX_LENGTH = 200;

export interface UserFilters {
    role?: string;
    isActive?: boolean;
    q?: string;
    page: number;
    limit: number;
}

export interface UserDraft {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
    roleId: number;
}

export type UserChanges = Partial<UserDraft>;

function assertValidBio(value: string): void {
    if (value.length > BIO_MAX_LENGTH) {
        throw new ValidationError(`La biografía no puede superar ${BIO_MAX_LENGTH} caracteres`);
    }
}

function assertValidRoleId(value: number): void {
    if (!Number.isInteger(value) || value <= 0) {
        throw new ValidationError('Selecciona un rol');
    }
}

/** Create rules, mirroring the backend. The first failing rule throws. */
export function assertValidUserDraft(draft: UserDraft): void {
    assertValidUsername(draft.username ?? '');
    assertValidEmail(draft.email ?? '');
    assertValidPassword(draft.password ?? '');
    if (draft.fullName !== undefined) {
        assertValidFullName(draft.fullName);
    }
    if (draft.bio !== undefined) {
        assertValidBio(draft.bio);
    }
    assertValidRoleId(draft.roleId);
}

/** Update rules: only the fields that are present are validated. */
export function assertValidUserChanges(changes: UserChanges): void {
    if (changes.username !== undefined) {
        assertValidUsername(changes.username);
    }
    if (changes.email !== undefined) {
        assertValidEmail(changes.email);
    }
    if (changes.password !== undefined) {
        assertValidPassword(changes.password);
    }
    if (changes.fullName !== undefined) {
        assertValidFullName(changes.fullName);
    }
    if (changes.bio !== undefined) {
        assertValidBio(changes.bio);
    }
    if (changes.roleId !== undefined) {
        assertValidRoleId(changes.roleId);
    }
}

export class UserAccount {
    constructor(
        readonly id: number,
        readonly username: string,
        readonly email: string,
        readonly fullName: string | null,
        readonly bio: string | null,
        readonly isActive: boolean,
        readonly roleId: number,
        readonly roleName: string,
    ) {}
}
