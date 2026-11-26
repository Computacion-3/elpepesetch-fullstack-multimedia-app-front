import type {
  UserListChanges,
  UserListDraft,
} from '../../domain/entities/user-list';
import type { PublicListsQuery } from '../../domain/repositories/user-lists.repository';

type MediaType = 'GAME' | 'MOVIE' | 'BOOK';
type ListVisibility = 'PRIVATE' | 'PUBLIC';

export interface UserListMediaDto {
  id: string;
  title: string;
  type: MediaType;
  coverUrl: string | null;
  releaseYear: number;
  creator: string;
  pages: number | null;
  durationMinutes: number | null;
  platform: string | null;
  averageRating: number | string;
  ratingsCount: number;
  genres?: { id: string; name: string }[];
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface UserListDto {
  id: string;
  name: string;
  description: string | null;
  visibility: ListVisibility;
  createdAt: string;
  updatedAt: string;
  owner: { id: number; username: string };
  ownerUsername?: string;
  items: UserListMediaDto[];
}

export interface PaginatedUserListsDto {
  data: UserListDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type CreateUserListDto = UserListDraft;
export type UpdateUserListDto = UserListChanges;
export type PublicListsQueryDto = PublicListsQuery;
