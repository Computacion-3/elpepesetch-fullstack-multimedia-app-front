import path from 'node:path';

/** Cuentas que crea db/seed.sql en el backend. */
export const ACCOUNTS = {
    admin: {
        key: 'admin',
        email: 'admin@example.com',
        password: 'Admin1234',
        username: 'admin',
        fullName: 'Admin Prueba',
        role: 'ADMIN',
    },
    moderator: {
        key: 'moderator',
        email: 'moderator@example.com',
        password: 'Moderator1234',
        username: 'moderator',
        fullName: 'Moderador Prueba',
        role: 'MODERATOR',
    },
    user: {
        key: 'user',
        email: 'user@example.com',
        password: 'User12345',
        username: 'user',
        fullName: 'Usuario Prueba',
        role: 'USER',
    },
} as const;

export type AccountKey = keyof typeof ACCOUNTS;
export type Account = { email: string; password: string };

/** Sesión guardada por auth.setup.ts para reutilizarla en las pruebas. */
export function storageStatePath(key: AccountKey): string {
    return path.join(__dirname, '..', '.auth', `${key}.json`);
}

/**
 * Prefijos de todo lo que crean las pruebas. global.teardown.ts borra lo que quede con ellos,
 * así una prueba que falle a mitad de camino no deja basura en la base.
 */
export const PREFIX = {
    user: 'e2e_',
    role: 'E2E_',
    permission: 'e2e:',
} as const;

export const TEST_PASSWORD = 'E2ePassw0rd';

/** Sufijo corto y único (cabe en los 30 caracteres de un nombre de usuario). */
export function uid(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Datos de un usuario nuevo con el prefijo de E2E. */
export function newUserData(tag = '') {
    const username = `${PREFIX.user}${tag}${uid()}`;
    return {
        username,
        email: `${username}@e2e.example.com`,
        password: TEST_PASSWORD,
        fullName: `E2E ${username}`,
    };
}

/** Elementos multimedia fijos creados por db/seed.sql en el backend. */
export const SEEDED_MEDIA = {
    zelda: {
        id: '10000000-0000-4000-8000-000000000001',
        title: 'The Legend of Zelda: Breath of the Wild',
    },
    hades: {
        id: '10000000-0000-4000-8000-000000000002',
        title: 'Hades',
    },
    matrix: {
        id: '10000000-0000-4000-8000-000000000006',
        title: 'The Matrix',
    },
    chihiro: {
        id: '10000000-0000-4000-8000-000000000007',
        title: 'El viaje de Chihiro',
    },
    cienAnos: {
        id: '10000000-0000-4000-8000-000000000011',
        title: 'Cien años de soledad',
    },
} as const;

/** Mensajes que la interfaz debe mostrar (vienen del dominio del front o del backend). */
export const MESSAGES = {
    invalidCredentials: 'Credenciales inválidas',
    accountDisabled: 'La cuenta está desactivada',
    registered: 'Cuenta creada. Ya puedes iniciar sesión.',
    passwordTooShort: 'La contraseña debe tener mínimo 8 caracteres',
    passwordWeak: 'La contraseña debe incluir una mayúscula, una minúscula y un número',
    usernameChars: 'El usuario solo puede tener letras, números y guion bajo',
    userConflict: 'El correo electrónico o el nombre de usuario ya están en uso',
    roleRequired: 'Selecciona un rol',
    roleConflict: 'Ya existe un rol con ese nombre',
    roleInUse: 'No se puede eliminar un rol que tiene usuarios asignados',
    permissionConflict: 'Ya existe un permiso con ese nombre',
    forbiddenAction: 'No tienes permiso para realizar esta acción',
    forbiddenPage: 'Acceso denegado',
    reviewContentTooShort: 'El contenido de la reseña debe tener al menos 10 caracteres',
    reviewCreated: 'Reseña publicada correctamente.',
    reviewUpdated: 'Reseña actualizada correctamente.',
    reviewDeleted: 'Reseña eliminada correctamente.',
    reportSent: 'Reporte enviado correctamente para moderación.',
    reportConflict: 'Ya reportaste esta reseña',
    reportHideReasonRequired: 'El motivo es obligatorio para ocultar una reseña',
    reportResolvedHide: 'Reseña ocultada y reporte marcado como resuelto.',
    reportResolvedDismiss: 'Reporte descartado; la reseña permanece visible.',
} as const;
