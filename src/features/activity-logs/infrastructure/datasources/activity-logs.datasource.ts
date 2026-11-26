import type { ActivityQuery } from '../../domain/entities/activity-log';
import type { ActivityPaginationDto } from '../dtos/activity-log.dto';

export interface ActivityLogsDatasource {
  fetchMyActivity(query: ActivityQuery): Promise<ActivityPaginationDto>;
}

