import type { User } from '../../domain/entities/user';

/** Plain, serializable user data for the UI (this, not the entity, goes into Redux). */
export interface AuthUserViewModel {
    id: number;
    username: string;
    email: string;
    displayName: string;
    initials: string;
    role: string;
    permissions: string[];
}

export class AuthViewModelMapper {
    static toViewModel(user: User): AuthUserViewModel {
        const displayName = user.fullName ?? user.username;
        const initials = displayName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName,
            initials,
            role: user.role,
            permissions: [...user.permissions],
        };
    }
}
