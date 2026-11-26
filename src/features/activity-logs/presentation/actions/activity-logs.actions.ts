'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { ActivityQuery } from '../../domain/entities/activity-log';
import { createActivityLogsContainer } from '../../di/activity-logs.container';
import { ActivityLogViewModelMapper, type ActivityPaginationViewModel } from '../viewmodels/activity-log.viewmodel';

export async function getMyActivityAction(query: ActivityQuery): Promise<ActionResult<ActivityPaginationViewModel>> {
  return runAuthenticated('No se pudo cargar tu actividad.', async (token) => {
    const activity = createActivityLogsContainer({ token });
    return ActivityLogViewModelMapper.toPaginatedViewModel(await activity.getMyActivity.execute(query));
  });
}
