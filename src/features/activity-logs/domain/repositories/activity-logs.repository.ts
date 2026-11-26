import type { ActivityQuery, ActivityLog, Paginated } from '../entities/activity-log';

export interface ActivityLogsRepository {
  getMyActivity(query: ActivityQuery): Promise<Paginated<ActivityLog>>;
}

