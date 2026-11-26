import { ActivityItem } from './ActivityItem';
import type { ActivityLogViewModel } from '../viewmodels/activity-log.viewmodel';

export function ActivityTimeline({ items }: { items: ActivityLogViewModel[] }) {
  return <ol aria-label="Historial de actividad" className="space-y-0">{items.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}</ol>;
}
