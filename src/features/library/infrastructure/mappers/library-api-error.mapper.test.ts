import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../../shared/domain/errors';
import { toLibraryDomainError } from './library-api-error.mapper';
import { HttpError } from '../../../../shared/infrastructure/http-client';

describe('toLibraryDomainError', () => {
  it('maps the API statuses and validation message arrays', () => {
    const validationError = toLibraryDomainError({
      statusCode: 400,
      message: ['first', 'second'],
    });
    assert.ok(validationError instanceof ValidationError);
    assert.equal(validationError.message, 'first\nsecond');
    assert.ok(
      toLibraryDomainError({
        statusCode: 401,
        message: 'Unauthorized',
      }) instanceof UnauthorizedError,
    );
    assert.ok(
      toLibraryDomainError({ statusCode: 404, message: 'Not found' }) instanceof
        NotFoundError,
    );
    assert.ok(
      toLibraryDomainError({ statusCode: 409, message: 'Duplicate' }) instanceof
        ConflictError,
    );
    assert.ok(
      toLibraryDomainError({ statusCode: 403, message: 'Forbidden' }) instanceof
        ForbiddenError,
    );
    assert.ok(toLibraryDomainError(new HttpError(403, 'Forbidden')) instanceof ForbiddenError);
  });
});
