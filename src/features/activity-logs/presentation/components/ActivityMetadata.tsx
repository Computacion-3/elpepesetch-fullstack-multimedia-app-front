import type { ActivityLogViewModel } from '../viewmodels/activity-log.viewmodel';

export function ActivityMetadata({ activity }: { activity: ActivityLogViewModel }) {
  return activity.context ? <p className="mt-1 text-sm text-gray-600">{activity.context}</p> : null;
}
