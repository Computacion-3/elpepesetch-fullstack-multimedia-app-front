import type { ActivityAction } from '../../domain/entities/activity-log';

const icons: Record<string, string> = { ENTRY_ADDED: '+', STATUS_CHANGED: '↻', PROGRESS_UPDATED: '◴', ENTRY_COMPLETED: '✓', FAVORITE_TOGGLED: '♥', REVIEW_CREATED: '✎', LIST_CREATED: '▤' };

export function ActivityIcon({ action }: { action: ActivityAction }) {
  return <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 font-semibold text-brand">{icons[action] ?? '•'}</span>;
}
