import { Role } from '../../domain/entities/role';
import type { RoleDraft } from '../../domain/entities/role';
import type { Permission } from '../../domain/entities/permission';
import type { RoleDto, RoleRequestDto } from '../dtos/roles.dto';
import { PermissionsMapper } from './permissions.mapper';

/** Translates between backend DTOs and domain entities. */
export class RolesMapper {
    static toRole(dto: RoleDto): Role {
        const permissions: Permission[] = [];
        for (const rp of dto.rolePermissions ?? []) {
            if (rp.permission) {
                permissions.push(PermissionsMapper.toPermission(rp.permission));
            }
        }
        return new Role(dto.id, dto.name, dto.description, permissions, dto.rolePermissions?.length ?? 0);
    }

    static toRequest(draft: RoleDraft): RoleRequestDto {
        return { name: draft.name.trim(), description: draft.description.trim() };
    }
}
