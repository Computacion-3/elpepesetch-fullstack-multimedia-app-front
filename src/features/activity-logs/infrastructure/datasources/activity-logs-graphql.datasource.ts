import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type { ActivityQuery } from '../../domain/entities/activity-log';
import type { ActivityPaginationDto } from '../dtos/activity-log.dto';
import type { ActivityLogsDatasource } from './activity-logs.datasource';

export const MY_ACTIVITY_QUERY = `query MyActivity($page: Int, $limit: Int) {
  myActivity(page: $page, limit: $limit) {
    data { id action metadata createdAt mediaItem {
      id title type coverUrl releaseYear creator pages durationMinutes platform averageRating ratingsCount genres { id name }
    } }
    meta { total page limit totalPages }
  }
}`;

export class ActivityLogsGraphQLDatasource implements ActivityLogsDatasource {
  constructor(private readonly graphql: GraphQLClient) {}

  async fetchMyActivity(query: ActivityQuery): Promise<ActivityPaginationDto> {
    const result = await this.graphql.execute<{ myActivity: ActivityPaginationDto }>(
      MY_ACTIVITY_QUERY, { page: query.page, limit: query.limit },
    );
    return result.myActivity;
  }
}
