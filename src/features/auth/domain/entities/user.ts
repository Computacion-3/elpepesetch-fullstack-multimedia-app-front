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

/** Cambios del perfil propio: solo viajan los campos que el usuario modificó. El rol no se edita aquí. */
export interface ProfileDraft {
    username?: string;
    email?: string;
    fullName?: string;
    bio?: string;
    password?: string;
}

const BIO_MAX_LENGTH = 200;

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

/** Reglas del perfil, iguales a las del registro para cada campo presente. */
export function assertValidProfileDraft(draft: ProfileDraft): void {
    const fields = Object.values(draft).filter((value) => value !== undefined);
    if (fields.length === 0) {
        throw new ValidationError('No hay cambios para guardar');
    }
    if (draft.username !== undefined) assertValidUsername(draft.username);
    if (draft.email !== undefined) assertValidEmail(draft.email);
    if (draft.fullName !== undefined) assertValidFullName(draft.fullName);
    if (draft.bio !== undefined && draft.bio.length > BIO_MAX_LENGTH) {
        throw new ValidationError(`La biografía no puede superar ${BIO_MAX_LENGTH} caracteres`);
    }
    if (draft.password !== undefined) assertValidPassword(draft.password);
}

export class User {
    constructor(
        readonly id: number,
        readonly username: string,
        readonly email: string,
        readonly fullName: string | null,
        readonly role: string,
        readonly permissions: readonly string[],
        readonly bio: string | null = null,
    ) {}

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }
}
