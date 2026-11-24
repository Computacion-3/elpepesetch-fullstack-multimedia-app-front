import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type {
    CreateUserRequestDto,
    PaginatedUsersDto,
    UpdateUserRequestDto,
    UserDto,
} from '../dtos/users.dto';
import type { UsersDatasource } from './users.datasource';

/** REST implementation of the users datasource. */
export class UsersRestDatasource implements UsersDatasource {
    constructor(private readonly http: HttpClient) {}

    list(token: string, query: string): Promise<PaginatedUsersDto> {
        return this.http.get<PaginatedUsersDto>(`/users?${query}`, token);
    }

    create(token: string, body: CreateUserRequestDto): Promise<UserDto> {
        return this.http.post<UserDto>('/users', body, token);
    }

    update(token: string, id: number, body: UpdateUserRequestDto): Promise<UserDto> {
        return this.http.patch<UserDto>(`/users/${id}`, body, token);
    }

    assignRole(token: string, id: number, roleId: number): Promise<UserDto> {
        return this.http.patch<UserDto>(`/users/${id}/roles`, { roleId }, token);
    }

    setStatus(token: string, id: number, isActive: boolean): Promise<UserDto> {
        return this.http.patch<UserDto>(`/users/${id}/status`, { isActive }, token);
    }

    async remove(token: string, id: number): Promise<void> {
        await this.http.delete<unknown>(`/users/${id}`, token);
    }
}
