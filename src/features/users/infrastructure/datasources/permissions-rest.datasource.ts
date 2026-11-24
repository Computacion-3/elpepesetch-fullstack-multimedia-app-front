import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { PermissionDto, PermissionRequestDto } from '../dtos/permissions.dto';
import type { PermissionsDatasource } from './permissions.datasource';

/** REST implementation of the permissions datasource. */
export class PermissionsRestDatasource implements PermissionsDatasource {
    constructor(private readonly http: HttpClient) {}

    list(token: string): Promise<PermissionDto[]> {
        return this.http.get<PermissionDto[]>('/permissions', token);
    }

    create(token: string, body: PermissionRequestDto): Promise<PermissionDto> {
        return this.http.post<PermissionDto>('/permissions', body, token);
    }

    update(token: string, id: number, body: PermissionRequestDto): Promise<PermissionDto> {
        return this.http.patch<PermissionDto>(`/permissions/${id}`, body, token);
    }

    async remove(token: string, id: number): Promise<void> {
        await this.http.delete<void>(`/permissions/${id}`, token);
    }
}
