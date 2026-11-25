import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HttpClient } from './http-client';
import { HttpError } from './http-client';
import { createGraphQLClient } from './graphql-client';

function createHttp(response: unknown): HttpClient {
  return {
    get: async <T>() => undefined as T,
    post: async <T>() => response as T,
    put: async <T>() => undefined as T,
    patch: async <T>() => undefined as T,
    delete: async <T>() => undefined as T,
  };
}

describe('createGraphQLClient', () => {
  it('preserves the backend HTTP status from GraphQL extensions', async () => {
    const client = createGraphQLClient(createHttp({
      errors: [{ message: 'Forbidden resource', extensions: { code: 'FORBIDDEN', status: 403 } }],
    }));

    await assert.rejects(client.execute('query { me { id } }'), (error) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 403);
      return true;
    });
  });

  it('maps the backend GraphQL code when status is omitted', async () => {
    const client = createGraphQLClient(createHttp({
      errors: [{ message: 'Duplicate', extensions: { code: 'CONFLICT' } }],
    }));

    await assert.rejects(client.execute('mutation { createThing }'), (error) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 409);
      return true;
    });
  });
});
