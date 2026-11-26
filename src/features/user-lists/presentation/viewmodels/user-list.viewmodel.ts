import type { UserList } from '../../domain/entities/user-list';

export interface UserListViewModel {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdAt: string;
  updatedAt: string;
  owner: { id: number; username: string };
  items: {
    id: string;
    title: string;
    type: 'GAME' | 'MOVIE' | 'BOOK';
    creator: string;
    releaseYear: number;
    coverUrl?: string | null;
    pages?: number | null;
    durationMinutes?: number | null;
    platform?: string | null;
    averageRating?: number;
    ratingsCount?: number;
    genres: { id: string; name: string }[];
    approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  }[];
}

export class UserListViewModelMapper {
  static toViewModel(list: UserList): UserListViewModel {
    return {
      ...list,
      owner: { ...list.owner },
      items: list.items.map((item) => ({
        ...item,
        genres: item.genres?.map((genre) => ({ ...genre })) ?? [],
      })),
    };
  }

  static toPage(page: {
    items: UserList[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }) {
    return {
      ...page,
      items: page.items.map(UserListViewModelMapper.toViewModel),
    };
  }
}
