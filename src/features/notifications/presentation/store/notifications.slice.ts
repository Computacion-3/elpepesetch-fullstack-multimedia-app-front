import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { describeError } from '@/src/shared/domain/errors';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { NotificationQuery } from '../../domain/entities/notification';
import type { NotificationViewModel } from '../viewmodels/notification.viewmodel';

/** Operaciones inyectadas como Server Actions para no llevar HTTP al store. */
export interface NotificationsDependencies {
  list: (query: NotificationQuery) => Promise<ActionResult<{
    data: NotificationViewModel[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>>;
  markRead: (id: string) => Promise<ActionResult<NotificationViewModel>>;
}

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface NotificationsState {
  items: NotificationViewModel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  query: NotificationQuery;
  status: Status;
  unreadCount: number;
  errorMessage: string | null;
}

const initialState: NotificationsState = {
  items: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  query: { page: 1, limit: 10 },
  status: 'idle',
  unreadCount: 0,
  errorMessage: null,
};

const createNotificationsThunk = createAsyncThunk.withTypes<{
  state: { notifications: NotificationsState };
  extra: { notifications: NotificationsDependencies };
  rejectValue: string;
}>();

/** Descarga una página de notificaciones propias. */
export const fetchNotifications = createNotificationsThunk(
  'notifications/list',
  async (query: NotificationQuery, { extra, rejectWithValue }) => {
    try {
      const result = await extra.notifications.list(query);
      if (!result.ok) return rejectWithValue(result.message);
      return { ...result.data, query };
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudieron cargar las notificaciones.'));
    }
  },
);

/** Guarda el cambio de lectura en el backend. */
export const markNotificationRead = createNotificationsThunk(
  'notifications/markRead',
  async (id: string, { extra, rejectWithValue }) => {
    try {
      const result = await extra.notifications.markRead(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudo actualizar la notificación.'));
    }
  },
);

/** Recupera los avisos no leídos y su total tras conectar o reconectar el socket. */
export const syncNotifications = createNotificationsThunk(
  'notifications/syncUnread',
  async (_: void, { extra, getState, rejectWithValue }) => {
    try {
      const currentQuery = getState().notifications.query;
      const [pageResult, unreadResult] = await Promise.all([
        extra.notifications.list(currentQuery),
        extra.notifications.list({ page: 1, limit: 1, isRead: false }),
      ]);
      if (!pageResult.ok) return rejectWithValue(pageResult.message);
      if (!unreadResult.ok) return rejectWithValue(unreadResult.message);
      return { page: pageResult.data, unreadCount: unreadResult.data.meta.total };
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudieron sincronizar las notificaciones.'));
    }
  },
);

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => { state.errorMessage = null; },
    /** Sube el contador cuando llega un aviso por el socket. */
    incrementUnreadCount: (state) => { state.unreadCount += 1; },
    setUnreadCount: (state, action: PayloadAction<number>) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        state.status = 'loading';
        state.errorMessage = null;
        state.query = action.meta.arg;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.meta = action.payload.meta;
        state.query = action.payload.query;
        state.status = 'succeeded';
        if (action.payload.query.isRead === false) state.unreadCount = action.payload.meta.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.errorMessage = action.payload ?? 'No se pudieron cargar las notificaciones.';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const previous = state.items.find((item) => item.id === action.payload.id);
        state.items = state.items.map((item) => item.id === action.payload.id ? action.payload : item);
        if (previous && !previous.isRead && action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.errorMessage = action.payload ?? 'No se pudo actualizar la notificación.';
      })
      .addCase(syncNotifications.fulfilled, (state, action) => {
        state.items = action.payload.page.data;
        state.meta = action.payload.page.meta;
        state.unreadCount = action.payload.unreadCount;
        state.status = 'succeeded';
      })
      .addCase(syncNotifications.rejected, (state, action) => {
        state.errorMessage = action.payload ?? 'No se pudieron sincronizar las notificaciones.';
      });
  },
});

export const { clearNotificationsError, incrementUnreadCount, setUnreadCount } = notificationsSlice.actions;
