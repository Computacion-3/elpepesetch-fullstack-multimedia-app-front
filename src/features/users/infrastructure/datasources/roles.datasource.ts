import type { RoleDto, RoleRequestDto, SetRolePermissionsRequestDto } from '../dtos/roles.dto';

/** Transport-agnostic contract implemented by the roles datasources. */
export interface RolesDatasource {
    list(token: string): Promise<RoleDto[]>;
    get(token: string, id: number): Promise<RoleDto>;
    create(token: string, body: RoleRequestDto): Promise<RoleDto>;
    update(token: string, id: number, body: RoleRequestDto): Promise<RoleDto>;
    setPermissions(token: string, id: number, body: SetRolePermissionsRequestDto): Promise<RoleDto>;
    remove(token: string, id: number): Promise<void>;
}
