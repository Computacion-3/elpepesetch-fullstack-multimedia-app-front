import type { RealtimeState } from './realtime.slice';

type RealtimeRootState = { realtime: RealtimeState };

export const selectRealtimeStatus = (state: RealtimeRootState) => state.realtime.status;
export const selectSubscribedMediaItemId = (state: RealtimeRootState) => state.realtime.subscribedMediaItemId;
export const selectRealtimeEvents = (state: RealtimeRootState) => state.realtime.events;
export const selectLatestRealtimeEvent = (state: RealtimeRootState) => state.realtime.events[0] ?? null;
export const selectModerationQueueCounts = (state: RealtimeRootState) => state.realtime.moderationQueue;
export const selectRealtimeError = (state: RealtimeRootState) => state.realtime.errorMessage;
