import type { Role, RoleDraft } from '../entities/role';

/** Contract the data layer must fulfil. */
export interface RolesRepository {
    list(accessToken: string): Promise<Role[]>;
    get(accessToken: string, id: number): Promise<Role>;
    create(accessToken: string, draft: RoleDraft): Promise<Role>;
    update(accessToken: string, id: number, draft: RoleDraft): Promise<Role>;
    setPermissions(accessToken: string, id: number, permissionIds: number[]): Promise<Role>;
    remove(accessToken: string, id: number): Promise<void>;
}
