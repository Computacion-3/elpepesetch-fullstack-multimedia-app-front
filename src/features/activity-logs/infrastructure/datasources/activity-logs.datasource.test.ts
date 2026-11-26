import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { ActivityLogsGraphQLDatasource, MY_ACTIVITY_QUERY } from './activity-logs-graphql.datasource';
import { ActivityLogsHttpDatasource } from './activity-logs-http.datasource';

describe('Activity Logs datasources', () => {
  it('requests REST history with page and limit and keeps media unavailable', async () => {
    let request: [string, string | undefined] | undefined;
    const http = { get: async <T>(path: string, token?: string) => {
      request = [path, token];
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } } as T;
    } } as HttpClient;
    const result = await new ActivityLogsHttpDatasource(http, 'access-token').fetchMyActivity({ page: 1, limit: 10 });
    assert.deepEqual(request, ['/activity?page=1&limit=10', 'access-token']);
    assert.deepEqual(result.data, []);
  });

  it('queries the GraphQL media projection using the pagination variables', async () => {
    let received: { document: string; variables?: Record<string, unknown> } | undefined;
    const graphql: GraphQLClient = { execute: async <T>(document: string, variables?: Record<string, unknown>) => {
      received = { document, variables };
      return { myActivity: { data: [], meta: { total: 0, page: 2, limit: 20, totalPages: 0 } } } as T;
    } };
    const result = await new ActivityLogsGraphQLDatasource(graphql).fetchMyActivity({ page: 2, limit: 20 });
    assert.deepEqual(received?.variables, { page: 2, limit: 20 });
    assert.equal(received?.document, MY_ACTIVITY_QUERY);
    assert.match(MY_ACTIVITY_QUERY, /mediaItem \{/);
    assert.equal(result.meta.page, 2);
  });
});
