import type { Permission, PermissionDraft } from '../entities/permission';

/** Contract the data layer must fulfil. */
export interface PermissionsRepository {
    list(accessToken: string): Promise<Permission[]>;
    create(accessToken: string, draft: PermissionDraft): Promise<Permission>;
    update(accessToken: string, id: number, draft: PermissionDraft): Promise<Permission>;
    remove(accessToken: string, id: number): Promise<void>;
}
