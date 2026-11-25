/**
 * Domain errors shared by every feature.
 * Use cases and entities throw these; repositories translate infrastructure failures into them;
 * thunks turn them into user-facing messages with `describeError`.
 */
export abstract class DomainError extends Error {
    abstract readonly code: string;

    constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}

export class ValidationError extends DomainError {
    readonly code = 'VALIDATION';
}

export class NotFoundError extends DomainError {
    readonly code = 'NOT_FOUND';
}

export class UnauthorizedError extends DomainError {
    readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends DomainError {
    readonly code = 'FORBIDDEN';
}

export class ConflictError extends DomainError {
    readonly code = 'CONFLICT';
}

export class UnexpectedError extends DomainError {
    readonly code = 'UNEXPECTED';
}

/** Domain errors carry a safe message; anything else falls back to a generic one. */
export function describeError(err: unknown, fallback: string): string {
    return err instanceof DomainError ? err.message : fallback;
}
