import type { NotificationsState } from './notifications.slice';

type NotificationsRootState = { notifications: NotificationsState };

export const selectNotifications = (state: NotificationsRootState) => state.notifications.items;
export const selectNotificationsMeta = (state: NotificationsRootState) => state.notifications.meta;
export const selectNotificationsQuery = (state: NotificationsRootState) => state.notifications.query;
export const selectNotificationsStatus = (state: NotificationsRootState) => state.notifications.status;
export const selectUnreadNotificationCount = (state: NotificationsRootState) => state.notifications.unreadCount;
export const selectNotificationsError = (state: NotificationsRootState) => state.notifications.errorMessage;
