import { toDomainError } from '../../../../shared/infrastructure/error-translator';
import type { ActivityQuery } from '../../domain/entities/activity-log';
import type { ActivityLogsRepository } from '../../domain/repositories/activity-logs.repository';
import type { ActivityLogsDatasource } from '../datasources/activity-logs.datasource';
import { ActivityLogMapper } from '../mappers/activity-log.mapper';

export class ActivityLogsRepositoryImpl implements ActivityLogsRepository {
  constructor(private readonly datasource: ActivityLogsDatasource) {}

  async getMyActivity(query: ActivityQuery) {
    try {
      return ActivityLogMapper.toPaginatedDomain(await this.datasource.fetchMyActivity(query));
    } catch (error) {
      throw toDomainError(error);
    }
  }
}
