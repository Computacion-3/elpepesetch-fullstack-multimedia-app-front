import { HttpError } from '@/src/shared/infrastructure/http-client';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { Create__Feature__Dto, __Feature__ResponseDto } from '../dtos/__feature-kebab__.dto';
import type { __Feature__Datasource } from './__feature-kebab__.datasource';

const RESOURCE = '/__features-kebab__';

export class __Feature__HttpDatasource implements __Feature__Datasource {
    constructor(private readonly http: HttpClient) { }

    fetchAll(): Promise<__Feature__ResponseDto[]> {
        return this.http.get<__Feature__ResponseDto[]>(RESOURCE);
    }

    async fetchById(id: string): Promise<__Feature__ResponseDto | null> {
        try {
            return await this.http.get<__Feature__ResponseDto>(`${RESOURCE}/${id}`);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) return null;
            throw err;
        }
    }

    create(dto: Create__Feature__Dto): Promise<__Feature__ResponseDto> {
        return this.http.post<__Feature__ResponseDto>(RESOURCE, dto);
    }
}
