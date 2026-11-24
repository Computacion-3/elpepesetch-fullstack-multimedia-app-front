/** Backend login payload. */
export interface LoginRequestDto {
    email: string;
    password: string;
}

/** Backend login response: token plus a minimal user summary. */
export interface LoginResponseDto {
    accessToken: string;
    tokenType: string;
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
}

/** Backend register payload (the backend rejects undeclared fields). */
export interface RegisterRequestDto {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
}

/** Backend socket ticket (POST /auth/socket-token or mutation socketToken). */
export interface SocketTokenResponseDto {
    token: string;
    /** Seconds until the ticket expires. */
    expiresIn: number;
}

/** Backend user shape returned by register and me. */
export interface UserResponseDto {
    id: number;
    username: string;
    email: string;
    fullName?: string | null;
    bio?: string | null;
    role: {
        id: number;
        name: string;
        rolePermissions?: {
            id: number;
            permission?: {
                id: number;
                name: string;
                description: string;
            };
        }[];
    };
}
