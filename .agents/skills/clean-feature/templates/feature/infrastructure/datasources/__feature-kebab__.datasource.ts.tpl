import type { Create__Feature__Dto, __Feature__ResponseDto } from '../dtos/__feature-kebab__.dto';

/** One datasource contract per external service. Speaks DTOs, not entities. */
export interface __Feature__Datasource {
    fetchAll(): Promise<__Feature__ResponseDto[]>;
    fetchById(id: string): Promise<__Feature__ResponseDto | null>;
    create(dto: Create__Feature__Dto): Promise<__Feature__ResponseDto>;
}
