import { UserAccount } from '../../domain/entities/user-account';
import type { UserChanges, UserDraft, UserFilters } from '../../domain/entities/user-account';
import type { Page } from '@/src/shared/domain/page';
import type {
    CreateUserRequestDto,
    PaginatedUsersDto,
    UpdateUserRequestDto,
    UserDto,
} from '../dtos/users.dto';

/** Translates between backend DTOs and domain entities. */
export class UsersMapper {
    static toAccount(dto: UserDto): UserAccount {
        return new UserAccount(
            dto.id,
            dto.username,
            dto.email,
            dto.fullName ?? null,
            dto.bio ?? null,
            dto.isActive,
            dto.role.id,
            dto.role.name,
        );
    }

    static toPage(dto: PaginatedUsersDto): Page<UserAccount> {
        return {
            items: dto.data.map((item) => UsersMapper.toAccount(item)),
            total: dto.meta.total,
            page: dto.meta.page,
            limit: dto.meta.limit,
            totalPages: dto.meta.totalPages,
        };
    }

    static toQueryString(filters: UserFilters): string {
        const params = new URLSearchParams();
        const role = filters.role?.trim();
        if (role) params.set('role', role.toUpperCase());
        if (filters.isActive !== undefined) params.set('isActive', filters.isActive ? 'true' : 'false');
        const q = filters.q?.trim();
        if (q) params.set('q', q);
        params.set('page', String(filters.page));
        params.set('limit', String(filters.limit));
        return params.toString();
    }

    static toCreateRequest(draft: UserDraft): CreateUserRequestDto {
        const body: CreateUserRequestDto = {
            username: draft.username.trim(),
            email: draft.email.trim(),
            password: draft.password,
            roleId: draft.roleId,
        };
        const fullName = draft.fullName?.trim();
        if (fullName) body.fullName = fullName;
        const bio = draft.bio?.trim();
        if (bio) body.bio = bio;
        return body;
    }

    static toUpdateRequest(changes: UserChanges): UpdateUserRequestDto {
        const body: UpdateUserRequestDto = {};
        const username = changes.username?.trim();
        if (username) body.username = username;
        const email = changes.email?.trim();
        if (email) body.email = email;
        if (changes.password) body.password = changes.password;
        const fullName = changes.fullName?.trim();
        if (fullName) body.fullName = fullName;
        const bio = changes.bio?.trim();
        if (bio) body.bio = bio;
        if (changes.roleId !== undefined) body.roleId = changes.roleId;
        return body;
    }
}
