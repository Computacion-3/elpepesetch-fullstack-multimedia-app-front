import type { PermissionDto } from './permissions.dto';

export interface RoleDto {
    id: number;
    name: string;
    description: string;
    rolePermissions?: { id: number; permission?: PermissionDto }[];
}

export interface RoleRequestDto {
    name: string;
    description: string;
}

export interface SetRolePermissionsRequestDto {
    permissionIds: number[];
}
