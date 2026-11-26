import 'server-only';
import { createGraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { GetMyActivityUseCase } from '../domain/usecases/get-my-activity.usecase';
import type { ActivityLogsDatasource } from '../infrastructure/datasources/activity-logs.datasource';
import { ActivityLogsGraphQLDatasource } from '../infrastructure/datasources/activity-logs-graphql.datasource';
import { ActivityLogsHttpDatasource } from '../infrastructure/datasources/activity-logs-http.datasource';
import { ActivityLogsRepositoryImpl } from '../infrastructure/repositories/activity-logs.repository.impl';

export interface ActivityLogsContainerOptions {
  datasource?: ActivityLogsDatasource;
  token: string;
  dataSource?: string;
}

export function createActivityLogsContainer(options: ActivityLogsContainerOptions) {
  let datasource = options.datasource;
  if (!datasource) {
    const mode = options.dataSource ?? process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'rest';
    if (mode !== 'rest' && mode !== 'graphql') {
      throw new Error(`NEXT_PUBLIC_DATA_SOURCE debe ser "rest" o "graphql"; se recibió "${mode}".`);
    }
    const http = createFetchHttpClient();
    if (mode === 'rest') {
      datasource = new ActivityLogsHttpDatasource(http, options.token);
    } else {
      const graph = createGraphQLClient(http);
      const authenticatedGraph = {
        execute: <T>(document: string, variables?: Record<string, unknown>) => graph.execute<T>(document, variables, options.token),
      };
      datasource = new ActivityLogsGraphQLDatasource(authenticatedGraph);
    }
  }
  return { getMyActivity: new GetMyActivityUseCase(new ActivityLogsRepositoryImpl(datasource)) };
}
