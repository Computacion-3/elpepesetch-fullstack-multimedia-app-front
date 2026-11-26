import type { LibraryApiErrorDto } from '../dtos/library.dto';
import { HttpError } from '../../../../shared/infrastructure/http-client';
import { toDomainError } from '../../../../shared/infrastructure/error-translator';

export type LibraryApiClientError = LibraryApiErrorDto;

export function toLibraryDomainError(error: unknown): unknown {
  if (error instanceof HttpError) return toDomainError(error);
  if (!isLibraryApiClientError(error)) return error;

  const message = Array.isArray(error.message)
    ? error.message.join('\n')
    : error.message;
  return toDomainError(new HttpError(error.statusCode, message, error));
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
