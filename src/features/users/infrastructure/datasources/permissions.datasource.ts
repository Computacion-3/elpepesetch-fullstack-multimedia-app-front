import type { PermissionDto, PermissionRequestDto } from '../dtos/permissions.dto';

/** Transport-agnostic contract implemented by the permissions datasources. */
export interface PermissionsDatasource {
    list(token: string): Promise<PermissionDto[]>;
    create(token: string, body: PermissionRequestDto): Promise<PermissionDto>;
    update(token: string, id: number, body: PermissionRequestDto): Promise<PermissionDto>;
    remove(token: string, id: number): Promise<void>;
}
