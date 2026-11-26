'use client';

import { useEffect, useRef } from 'react';
import { useRealtime } from '@/src/features/realtime/presentation/hooks/use-realtime';
import { ActivityView } from '@/src/features/activity-logs/presentation/components/ActivityView';
import { useActivityLogs } from '@/src/features/activity-logs/presentation/hooks/use-activity-logs';

export function ActivityRouteClient() {
  const { status, latestEvent } = useRealtime();
  const activity = useActivityLogs();
  const { markNewActivity, reload } = activity;
  const seenActivityId = useRef<string | null>(null);
  const previousStatus = useRef(status);
  useEffect(() => {
    if (latestEvent?.event !== 'activity.created') return;
    const payload = latestEvent.payload as { activityId?: unknown };
    if (typeof payload.activityId !== 'string' || payload.activityId === seenActivityId.current) return;
    seenActivityId.current = payload.activityId;
    markNewActivity();
    void reload();
  }, [latestEvent, markNewActivity, reload]);
  useEffect(() => {
    if (previousStatus.current === 'reconnecting' && status === 'connected') void reload();
    previousStatus.current = status;
  }, [reload, status]);
  return <ActivityView />;
}
