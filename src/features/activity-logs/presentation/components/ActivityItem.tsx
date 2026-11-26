import Image from 'next/image';
import Link from 'next/link';
import { ActivityIcon } from './ActivityIcon';
import { ActivityMetadata } from './ActivityMetadata';
import type { ActivityLogViewModel } from '../viewmodels/activity-log.viewmodel';

export function ActivityItem({ activity }: { activity: ActivityLogViewModel }) {
  return <li className="relative flex gap-4 pb-8 last:pb-0">
    <ActivityIcon action={activity.action} />
    <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="font-medium text-gray-900">{activity.description}</p>
      <ActivityMetadata activity={activity} />
      <time className="mt-2 block text-sm text-gray-500" dateTime={activity.createdAt}>{activity.dateLabel}</time>
      {activity.mediaItem && activity.mediaHref ? <Link href={activity.mediaHref} className="mt-4 flex w-fit items-center gap-3 rounded-md bg-gray-50 p-2 hover:bg-gray-100">
        {activity.mediaItem.coverUrl ? <Image src={activity.mediaItem.coverUrl} alt="" width={40} height={56} unoptimized className="h-14 w-10 rounded object-cover" /> : null}
        <span className="min-w-0"><span className="block font-medium text-brand">{activity.mediaItem.title}</span><span className="text-xs text-gray-600">{activity.mediaItem.type}</span></span>
      </Link> : null}
    </div>
  </li>;
}
