import { ValidationError } from '../../../../shared/domain/errors';
import type { ActivityQuery, ActivityLog, Paginated } from '../entities/activity-log';
import type { ActivityLogsRepository } from '../repositories/activity-logs.repository';

export class GetMyActivityUseCase {
  constructor(private readonly repository: ActivityLogsRepository) {}

  execute(query: Partial<ActivityQuery> = {}): Promise<Paginated<ActivityLog>> {
    const normalized = { page: query.page ?? 1, limit: query.limit ?? 10 };
    if (!Number.isInteger(normalized.page) || normalized.page < 1) {
      throw new ValidationError('La página debe ser un entero mayor o igual a 1.');
    }
    if (!Number.isInteger(normalized.limit) || normalized.limit < 1 || normalized.limit > 50) {
      throw new ValidationError('El límite debe ser un entero entre 1 y 50.');
    }
    return this.repository.getMyActivity(normalized);
  }
}
