/** Backend user shape. */
export interface UserDto {
    id: number;
    username: string;
    email: string;
    fullName?: string | null;
    bio?: string | null;
    isActive: boolean;
    role: {
        id: number;
        name: string;
    };
}

/** Backend paginated users response. */
export interface PaginatedUsersDto {
    data: UserDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/** Backend create-user payload (the backend rejects undeclared fields). */
export interface CreateUserRequestDto {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
    roleId: number;
}

export type UpdateUserRequestDto = Partial<CreateUserRequestDto>;
