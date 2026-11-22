import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { RoleDto, RoleRequestDto, SetRolePermissionsRequestDto } from '../dtos/roles.dto';
import type { RolesDatasource } from './roles.datasource';

/** REST implementation of the roles datasource. */
export class RolesRestDatasource implements RolesDatasource {
    constructor(private readonly http: HttpClient) {}

    list(token: string): Promise<RoleDto[]> {
        return this.http.get<RoleDto[]>('/roles', token);
    }

    get(token: string, id: number): Promise<RoleDto> {
        return this.http.get<RoleDto>(`/roles/${id}`, token);
    }

    create(token: string, body: RoleRequestDto): Promise<RoleDto> {
        return this.http.post<RoleDto>('/roles', body, token);
    }

    update(token: string, id: number, body: RoleRequestDto): Promise<RoleDto> {
        return this.http.patch<RoleDto>(`/roles/${id}`, body, token);
    }

    setPermissions(token: string, id: number, body: SetRolePermissionsRequestDto): Promise<RoleDto> {
        return this.http.put<RoleDto>(`/roles/${id}/permissions`, body, token);
    }

    async remove(token: string, id: number): Promise<void> {
        await this.http.delete<unknown>(`/roles/${id}`, token);
    }
}
