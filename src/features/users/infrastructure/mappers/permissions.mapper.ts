import { Permission } from '../../domain/entities/permission';
import type { PermissionDraft } from '../../domain/entities/permission';
import type { PermissionDto, PermissionRequestDto } from '../dtos/permissions.dto';

/** Translates between backend DTOs and domain entities. */
export class PermissionsMapper {
    static toPermission(dto: PermissionDto): Permission {
        return new Permission(dto.id, dto.name, dto.description);
    }

    static toRequest(draft: PermissionDraft): PermissionRequestDto {
        return { name: draft.name.trim(), description: draft.description.trim() };
    }
}
