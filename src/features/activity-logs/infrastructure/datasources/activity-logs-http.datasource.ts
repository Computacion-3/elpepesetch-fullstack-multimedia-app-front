import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { ActivityQuery } from '../../domain/entities/activity-log';
import type { ActivityPaginationDto } from '../dtos/activity-log.dto';
import type { ActivityLogsDatasource } from './activity-logs.datasource';

export class ActivityLogsHttpDatasource implements ActivityLogsDatasource {
  constructor(private readonly http: HttpClient, private readonly token: string) {}

  fetchMyActivity(query: ActivityQuery): Promise<ActivityPaginationDto> {
    const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
    return this.http.get(`/activity?${params}`, this.token);
  }
}
