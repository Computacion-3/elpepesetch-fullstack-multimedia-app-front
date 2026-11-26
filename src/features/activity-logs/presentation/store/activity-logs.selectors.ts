import type { ActivityLogsState } from './activity-logs.slice';

type ActivityLogsRootState = { activityLogs: ActivityLogsState };
export const selectActivityItems = (state: ActivityLogsRootState) => state.activityLogs.items;
export const selectActivityMeta = (state: ActivityLogsRootState) => state.activityLogs.meta;
export const selectActivityPage = (state: ActivityLogsRootState) => state.activityLogs.page;
export const selectActivityStatus = (state: ActivityLogsRootState) => state.activityLogs.status;
export const selectActivityError = (state: ActivityLogsRootState) => state.activityLogs.errorMessage;
export const selectHasNewActivities = (state: ActivityLogsRootState) => state.activityLogs.hasNewActivities;
