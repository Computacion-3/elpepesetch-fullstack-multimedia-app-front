import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../../shared/domain/errors';
import type { LibraryApiErrorDto } from '../dtos/library.dto';

export type LibraryApiClientError = LibraryApiErrorDto;

export function toLibraryDomainError(error: unknown): unknown {
  if (!isLibraryApiClientError(error)) return error;

  const message = Array.isArray(error.message)
    ? error.message.join('\n')
    : error.message;
  switch (error.statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new UnauthorizedError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    default:
      return new Error(message || 'Error al comunicarse con el servidor.');
  }
}

function isLibraryApiClientError(
  error: unknown,
): error is LibraryApiClientError {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as Record<string, unknown>;
  return (
    typeof candidate.statusCode === 'number' &&
    (typeof candidate.message === 'string' ||
      (Array.isArray(candidate.message) &&
        candidate.message.every((message) => typeof message === 'string')))
  );
}
