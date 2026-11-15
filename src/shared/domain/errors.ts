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

export function describeError(error: unknown, fallback: string): string {
  return error instanceof DomainError ? error.message : fallback;
}
