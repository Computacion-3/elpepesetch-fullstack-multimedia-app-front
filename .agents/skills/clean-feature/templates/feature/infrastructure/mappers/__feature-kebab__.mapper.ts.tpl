import { __Feature__ } from '../../domain/entities/__feature-kebab__';
import type { Create__Feature__Params } from '../../domain/repositories/__feature-kebab__.repository';
import type { Create__Feature__Dto, __Feature__ResponseDto } from '../dtos/__feature-kebab__.dto';

/**
 * Translates between backend DTOs and domain entities.
 * Never inject session data here (user ids, tokens): it must arrive through params or the http client.
 */
export class __Feature__Mapper {
    static toDomain(dto: __Feature__ResponseDto): __Feature__ {
        return new __Feature__({
            id: String(dto.id),
            name: dto.name,
            description: dto.description ?? undefined,
            createdAt: new Date(dto.created_at),
        });
    }

    static toCreateDto(params: Create__Feature__Params): Create__Feature__Dto {
        return {
            name: params.name,
            description: params.description,
        };
    }
}
