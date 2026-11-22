import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { LoginRequestDto, LoginResponseDto, RegisterRequestDto, UserResponseDto } from '../dtos/auth.dto';
import type { AuthDatasource } from './auth.datasource';

/** REST implementation of the auth datasource. */
export class AuthRestDatasource implements AuthDatasource {
    constructor(private readonly http: HttpClient) {}

    login(body: LoginRequestDto): Promise<LoginResponseDto> {
        return this.http.post<LoginResponseDto>('/auth/login', body);
    }

    register(body: RegisterRequestDto): Promise<UserResponseDto> {
        return this.http.post<UserResponseDto>('/auth/register', body);
    }

    async logout(token: string): Promise<void> {
        await this.http.post<void>('/auth/logout', undefined, token);
    }

    me(token: string): Promise<UserResponseDto> {
        return this.http.get<UserResponseDto>('/auth/me', token);
    }
}
