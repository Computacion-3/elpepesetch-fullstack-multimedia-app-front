import { ValidationError } from '@/src/shared/domain/errors';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MAX_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^\w+$/;

/** Username rules: length and allowed characters. */
export function assertValidUsername(value: string): void {
    const username = value ?? '';
    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
        throw new ValidationError(
            `El usuario debe tener entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres`,
        );
    }
    if (!USERNAME_PATTERN.test(username)) {
        throw new ValidationError('El usuario solo puede tener letras, números y guion bajo');
    }
}

/** Email rule: basic address shape. */
export function assertValidEmail(value: string): void {
    if (!EMAIL_PATTERN.test(value ?? '')) {
        throw new ValidationError('El correo electrónico no es válido');
    }
}

/** Password rules: minimum length plus uppercase, lowercase and digit. */
export function assertValidPassword(value: string): void {
    const password = value ?? '';
    if (password.length < PASSWORD_MIN_LENGTH) {
        throw new ValidationError(`La contraseña debe tener mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        throw new ValidationError('La contraseña debe incluir una mayúscula, una minúscula y un número');
    }
}

/** Full name rule: maximum length. */
export function assertValidFullName(value: string): void {
    if (value.length > FULL_NAME_MAX_LENGTH) {
        throw new ValidationError(`El nombre completo no puede superar ${FULL_NAME_MAX_LENGTH} caracteres`);
    }
}
