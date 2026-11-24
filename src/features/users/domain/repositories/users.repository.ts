import type { Page } from '@/src/shared/domain/page';
import type { UserAccount, UserChanges, UserDraft, UserFilters } from '../entities/user-account';

/** Contract the data layer must fulfil. */
export interface UsersRepository {
    list(accessToken: string, filters: UserFilters): Promise<Page<UserAccount>>;
    create(accessToken: string, draft: UserDraft): Promise<UserAccount>;
    update(accessToken: string, id: number, changes: UserChanges): Promise<UserAccount>;
    assignRole(accessToken: string, id: number, roleId: number): Promise<UserAccount>;
    setStatus(accessToken: string, id: number, isActive: boolean): Promise<UserAccount>;
    remove(accessToken: string, id: number): Promise<void>;
}
