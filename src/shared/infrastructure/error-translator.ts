import {
    ConflictError,
    DomainError,
    NotFoundError,
    UnauthorizedError,
    UnexpectedError,
    ValidationError,
} from '@/src/shared/domain/errors';
import { HttpError } from './http-client';

/**
 * Repositories call this in their catch blocks so that no HttpError / SDK error
 * ever crosses into the domain or presentation layers.
 */
export function toDomainError(err: unknown): DomainError {
    if (err instanceof DomainError) return err;

    if (err instanceof HttpError) {
        if (err.status === 400 || err.status === 422) return new ValidationError(err.message);
        if (err.status === 401 || err.status === 403) return new UnauthorizedError(err.message);
        if (err.status === 404) return new NotFoundError(err.message);
        if (err.status === 409) return new ConflictError(err.message);
    }

    return new UnexpectedError('Unexpected error while contacting the server.');
}
