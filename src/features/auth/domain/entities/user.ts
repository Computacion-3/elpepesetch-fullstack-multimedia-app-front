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

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MAX_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^\w+$/;

/** Login rules: valid email and a non-empty password. */
export function assertValidLoginCredentials(credentials: LoginCredentials): void {
    if (!EMAIL_PATTERN.test(credentials.email ?? '')) {
        throw new ValidationError('El correo electrónico no es válido');
    }
    if (!credentials.password) {
        throw new ValidationError('Ingresa tu contraseña');
    }
}

/** Register rules, mirroring the backend. The first failing rule throws. */
export function assertValidRegisterDraft(draft: RegisterDraft): void {
    const username = draft.username ?? '';
    const password = draft.password ?? '';
    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
        throw new ValidationError(
            `El usuario debe tener entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres`,
        );
    }
    if (!USERNAME_PATTERN.test(username)) {
        throw new ValidationError('El usuario solo puede tener letras, números y guion bajo');
    }
    if (!EMAIL_PATTERN.test(draft.email ?? '')) {
        throw new ValidationError('El correo electrónico no es válido');
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        throw new ValidationError(`La contraseña debe tener mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        throw new ValidationError('La contraseña debe incluir una mayúscula, una minúscula y un número');
    }
    if (draft.fullName !== undefined && draft.fullName.length > FULL_NAME_MAX_LENGTH) {
        throw new ValidationError(`El nombre completo no puede superar ${FULL_NAME_MAX_LENGTH} caracteres`);
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
