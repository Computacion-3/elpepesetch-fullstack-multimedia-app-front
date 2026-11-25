/** Permission codes used to gate admin features. */
export const PERMISSIONS = {
    USERS_MANAGE: 'users:manage',
    ROLES_MANAGE: 'roles:manage',
    PERMISSIONS_MANAGE: 'permissions:manage',
    CATALOG_CREATE: 'catalog:create',
    CATALOG_UPDATE: 'catalog:update',
    CATALOG_MODERATE: 'catalog:moderate',
    GENRES_MANAGE: 'genres:manage',
} as const;
