import { ValidationError } from '../../../../shared/domain/errors';
import type { LibraryMediaReference } from '../../../library/domain/entities/library-entry';

export type ListVisibility = 'PRIVATE' | 'PUBLIC';

export interface UserSummary {
  readonly id: number;
  readonly username: string;
}

export interface UserListProps {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: ListVisibility;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly owner: UserSummary;
  readonly items: readonly LibraryMediaReference[];
}

export interface UserListDraft {
  name: string;
  description?: string | null;
  visibility?: ListVisibility;
}

export type UserListChanges = Partial<UserListDraft>;

export function assertValidUserListDraft(draft: UserListDraft): void {
  if (!draft.name?.trim())
    throw new ValidationError('El nombre de la lista es obligatorio.');
  if (draft.name.trim().length > 80)
    throw new ValidationError('El nombre no puede superar 80 caracteres.');
  if (draft.description != null && draft.description.length > 255) {
    throw new ValidationError(
      'La descripción no puede superar 255 caracteres.',
    );
  }
  if (
    draft.visibility !== undefined &&
    !['PRIVATE', 'PUBLIC'].includes(draft.visibility)
  ) {
    throw new ValidationError('La visibilidad seleccionada no es válida.');
  }
}

export function assertValidUserListChanges(changes: UserListChanges): void {
  if (changes.name !== undefined) {
    if (!changes.name.trim())
      throw new ValidationError('El nombre de la lista es obligatorio.');
    if (changes.name.trim().length > 80)
      throw new ValidationError('El nombre no puede superar 80 caracteres.');
  }
  if (changes.description != null && changes.description.length > 255) {
    throw new ValidationError(
      'La descripción no puede superar 255 caracteres.',
    );
  }
  if (
    changes.visibility !== undefined &&
    !['PRIVATE', 'PUBLIC'].includes(changes.visibility)
  ) {
    throw new ValidationError('La visibilidad seleccionada no es válida.');
  }
}

export class UserList implements UserListProps {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: ListVisibility;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly owner: UserSummary;
  readonly items: readonly LibraryMediaReference[];

  constructor(props: UserListProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.visibility = props.visibility;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.owner = props.owner;
    this.items = props.items;
  }

  withChanges(changes: UserListChanges): UserList {
    assertValidUserListChanges(changes);
    return new UserList({ ...this, ...changes });
  }
}
