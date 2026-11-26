import { UserList, type UserListProps } from '../../domain/entities/user-list';
import type { Page } from '@/src/shared/domain/page';
import type { UserListDto } from '../dtos/user-list.dto';

export class UserListMapper {
  static toDomain(dto: UserListDto): UserList {
    const props: UserListProps = {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      visibility: dto.visibility,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      owner: {
        id: dto.owner.id,
        username: dto.ownerUsername ?? dto.owner.username,
      },
      items: dto.items.map((item) => ({
        ...item,
        cover: item.title.slice(0, 2).toUpperCase() || '??',
        coverUrl: item.coverUrl,
        averageRating: Number(item.averageRating),
        approvalStatus: item.approvalStatus,
        genreIds: item.genres.map((genre) => genre.id),
      })),
    };
    return new UserList(props);
  }

  static toPage(dto: {
    data: UserListDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }): Page<UserList> {
    return { ...dto.meta, items: dto.data.map(UserListMapper.toDomain) };
  }
}
