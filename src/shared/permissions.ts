/**
 * Códigos de permisos (authorities) emitidos por el backend en el token JWT.
 * Se utilizan tanto en Server Components / Server Actions (autorización en servidor)
 * como en componentes cliente mediante `hasPermission()` para adaptar la interfaz.
 */
export const PERMISSIONS = {
    USERS_MANAGE: 'users:manage',
    ROLES_MANAGE: 'roles:manage',
    PERMISSIONS_MANAGE: 'permissions:manage',
    REVIEWS_CREATE: 'reviews:create',
    REVIEWS_UPDATE: 'reviews:update',
    REVIEWS_DELETE: 'reviews:delete',
    REVIEWS_MODERATE: 'reviews:moderate',
    REPORTS_CREATE: 'reports:create',
    STATS_GLOBAL_READ: 'stats:read_global',
} as const;
