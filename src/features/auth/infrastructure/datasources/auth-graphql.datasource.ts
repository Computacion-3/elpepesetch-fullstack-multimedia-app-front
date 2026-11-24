import { HttpError, type HttpClient } from '@/src/shared/infrastructure/http-client';
import type {
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    SocketTokenResponseDto,
    UserResponseDto,
} from '../dtos/auth.dto';
import type { AuthDatasource } from './auth.datasource';

const LOGIN = `mutation Login($input: LoginInput!) { login(input: $input) { accessToken tokenType user { id username email role } } }`;
const REGISTER = `mutation Register($input: RegisterInput!) { register(input: $input) { id username email fullName bio role { id name } } }`;
const LOGOUT = `mutation { logout }`;
const SOCKET_TOKEN = `mutation { socketToken { token expiresIn } }`;
const ME = `{ me { id username email fullName bio role { id name rolePermissions { id permission { id name description } } } } }`;

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string; extensions?: { originalError?: { statusCode?: number; message?: string | string[] } } }[];
}

/** GraphQL implementation of the auth datasource. */
export class AuthGraphQLDatasource implements AuthDatasource {
    constructor(private readonly http: HttpClient) {}

    async login(body: LoginRequestDto): Promise<LoginResponseDto> {
        return (await this.execute<{ login: LoginResponseDto }>(LOGIN, { input: body })).login;
    }

    async register(body: RegisterRequestDto): Promise<UserResponseDto> {
        return (await this.execute<{ register: UserResponseDto }>(REGISTER, { input: body })).register;
    }

    async logout(token: string): Promise<void> {
        await this.execute(LOGOUT, undefined, token);
    }

    async me(token: string): Promise<UserResponseDto> {
        return (await this.execute<{ me: UserResponseDto }>(ME, undefined, token)).me;
    }

    async socketToken(token: string): Promise<SocketTokenResponseDto> {
        return (await this.execute<{ socketToken: SocketTokenResponseDto }>(SOCKET_TOKEN, undefined, token)).socketToken;
    }

    private async execute<T>(query: string, variables?: object, token?: string): Promise<T> {
        const response = await this.http.post<GraphQLResponse<T>>('/graphql', { query, variables }, token);
        // The backend answers Nest errors with HTTP 200, so they are read from the body, not the status.
        if (response.errors?.length) {
            const error = response.errors[0];
            const original = error.extensions?.originalError;
            throw new HttpError(
                original?.statusCode ?? 500,
                [original?.message ?? error.message].flat().join('. '),
                response,
            );
        }
        return response.data as T;
    }
}
