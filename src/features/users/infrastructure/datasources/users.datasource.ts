import type {
    CreateUserRequestDto,
    PaginatedUsersDto,
    UpdateUserRequestDto,
    UserDto,
} from '../dtos/users.dto';

/** Transport-agnostic contract implemented by the users datasources. */
export interface UsersDatasource {
    list(token: string, query: string): Promise<PaginatedUsersDto>;
    create(token: string, body: CreateUserRequestDto): Promise<UserDto>;
    update(token: string, id: number, body: UpdateUserRequestDto): Promise<UserDto>;
    assignRole(token: string, id: number, roleId: number): Promise<UserDto>;
    setStatus(token: string, id: number, isActive: boolean): Promise<UserDto>;
    remove(token: string, id: number): Promise<void>;
}
