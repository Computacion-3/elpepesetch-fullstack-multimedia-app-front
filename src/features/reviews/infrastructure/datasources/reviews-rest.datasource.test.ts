import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import { ReviewsRestDatasource } from './reviews-rest.datasource';

describe('ReviewsRestDatasource', () => {
  it('uses the media review route with pagination and the session token', async () => {
    let requestedPath = '';
    let requestedToken = '';
    const http = {
      get: async <T>(path: string, token?: string) => {
        requestedPath = path;
        requestedToken = token ?? '';
        return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } } as T;
      },
    } as unknown as HttpClient;

    await new ReviewsRestDatasource(http, 'session').fetchByMedia('media-id', { page: 1, limit: 10 });

    assert.equal(requestedPath, '/media/media-id/reviews?page=1&limit=10');
    assert.equal(requestedToken, 'session');
  });

  it('posts the entered review to its media element', async () => {
    let requestedPath = '';
    let submittedBody: unknown;
    const http = {
      post: async <T>(path: string, body: unknown, token?: string) => {
        requestedPath = `${path}:${token}`;
        submittedBody = body;
        return { id: 'review-1' } as T;
      },
    } as unknown as HttpClient;

    await new ReviewsRestDatasource(http, 'session').create('media-id', { title: 'Título', content: 'Una opinión válida.' });

    assert.equal(requestedPath, '/media/media-id/reviews:session');
    assert.deepEqual(submittedBody, { title: 'Título', content: 'Una opinión válida.' });
  });
});
