import type {
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    SocketTokenResponseDto,
    UserResponseDto,
} from '../dtos/auth.dto';

/** Transport-agnostic contract implemented by the REST and GraphQL datasources. */
export interface AuthDatasource {
    login(body: LoginRequestDto): Promise<LoginResponseDto>;
    register(body: RegisterRequestDto): Promise<UserResponseDto>;
    logout(token: string): Promise<void>;
    me(token: string): Promise<UserResponseDto>;
    socketToken(token: string): Promise<SocketTokenResponseDto>;
}
