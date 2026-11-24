import type { UserAccount } from '../../domain/entities/user-account';

/** Plain, serializable user data for the UI. */
export interface UserViewModel {
    id: number;
    username: string;
    email: string;
    fullName: string;
    bio: string;
    isActive: boolean;
    roleId: number;
    roleName: string;
    displayName: string;
}

/** Filters and pagination currently applied to the users list (kept in the store). */
export interface UsersFiltersViewModel {
    role?: string;
    isActive?: boolean;
    q?: string;
    page: number;
    limit: number;
}

export interface UsersPageViewModel {
    items: UserViewModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class UsersViewModelMapper {
    static toViewModel(account: UserAccount): UserViewModel {
        const fullName = account.fullName ?? '';
        return {
            id: account.id,
            username: account.username,
            email: account.email,
            fullName,
            bio: account.bio ?? '',
            isActive: account.isActive,
            roleId: account.roleId,
            roleName: account.roleName,
            displayName: fullName || account.username,
        };
    }

    /** Accepts the domain `Page<UserAccount>` structurally (view models may not import shared-domain). */
    static toPage(page: Omit<UsersPageViewModel, 'items'> & { items: UserAccount[] }): UsersPageViewModel {
        return {
            items: page.items.map((item) => UsersViewModelMapper.toViewModel(item)),
            total: page.total,
            page: page.page,
            limit: page.limit,
            totalPages: page.totalPages,
        };
    }
}
