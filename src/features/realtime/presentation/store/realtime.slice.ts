import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { describeError } from '@/src/shared/domain/errors';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { SocketTicket } from '@/src/features/auth/domain/entities/socket-ticket';
import { accountSessionEnded } from '@/src/features/auth/presentation/store/auth.slice';
import type { RealtimeConnectionStatus, RealtimeEventEnvelope, RealtimeEventName, RealtimeEventPayloads } from '../../domain/entities/realtime-event';
import { REALTIME_EVENT_NAMES } from '../../domain/entities/realtime-event';
import type { RealtimeRepository } from '../../domain/repositories/realtime.repository';

/** Operaciones de la conexión, expuestas por el contenedor de infraestructura. */
export type RealtimeDependencies = Pick<RealtimeRepository, 'connect' | 'disconnect' | 'on' | 'off' | 'onStatus' | 'clearStatusHandlers' | 'emit'> & {
  subscribeEvents: (events: readonly RealtimeEventName[], handler: (event: RealtimeEventName, payload: unknown) => void) => void;
  getTicket: () => Promise<ActionResult<SocketTicket>>;
  expireSession: () => Promise<void>;
};

export interface RealtimeState {
  status: RealtimeConnectionStatus;
  subscribedMediaItemId: string | null;
  events: RealtimeEventEnvelope[];
  moderationQueue: { pendingMedia: number; openReports: number } | null;
  errorMessage: string | null;
}

const initialState: RealtimeState = {
  status: 'disconnected',
  subscribedMediaItemId: null,
  events: [],
  moderationQueue: null,
  errorMessage: null,
};

const createRealtimeThunk = createAsyncThunk.withTypes<{
  state: { realtime: RealtimeState };
  extra: { realtime: RealtimeDependencies };
  rejectValue: string;
}>();

/** Abre Socket.IO y traduce los eventos entrantes a acciones de Redux. */
export const connectRealtime = createRealtimeThunk(
  'realtime/connect',
  async (_: void, { dispatch, extra, getState, rejectWithValue }) => {
    try {
      for (const event of REALTIME_EVENT_NAMES) extra.realtime.off(event);
      extra.realtime.clearStatusHandlers();

      extra.realtime.onStatus((status) => {
        dispatch(realtimeStatusChanged(status));
      });

      extra.realtime.subscribeEvents(REALTIME_EVENT_NAMES, (event, payload) => {
        const activeMediaId = getState().realtime.subscribedMediaItemId;
        const mediaItemId = event === 'review.created' ? activeMediaId ?? undefined : undefined;
        dispatch(realtimeEventReceived({
          event,
          payload: payload as RealtimeEventPayloads[RealtimeEventName],
          ...(mediaItemId ? { mediaItemId } : {}),
          receivedAt: new Date().toISOString(),
        }));

        if (event === 'account.deactivated') {
          void extra.realtime.expireSession()
            .catch(() => undefined)
            .finally(() => dispatch(accountSessionEnded('account-deactivated')));
        }
      });

      extra.realtime.connect(async () => {
        const result = await extra.realtime.getTicket();
        if (!result.ok) throw new Error(result.message);
        return result.data;
      });
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudo iniciar la conexión en tiempo real.'));
    }
  },
);

/** Cierra la conexión y quita los listeners de la sesión anterior. */
export const disconnectRealtime = createRealtimeThunk(
  'realtime/disconnect',
  async (_: void, { extra }) => { extra.realtime.disconnect(); },
);

/** Solicita entrar a la única sala multimedia validada por el backend. */
export const subscribeToMediaRoom = createRealtimeThunk(
  'realtime/subscribeMedia',
  async (mediaItemId: string, { extra, getState }) => {
    if (getState().realtime.status === 'connected') extra.realtime.emit('media.subscribe', { mediaItemId });
    return mediaItemId;
  },
);

/** Solicita salir de la sala al cerrar o cambiar el detalle multimedia. */
export const unsubscribeFromMediaRoom = createRealtimeThunk(
  'realtime/unsubscribeMedia',
  async (mediaItemId: string, { extra, getState }) => {
    if (getState().realtime.status === 'connected') extra.realtime.emit('media.unsubscribe', { mediaItemId });
    return mediaItemId;
  },
);

export const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    realtimeStatusChanged: (state, action: PayloadAction<RealtimeConnectionStatus>) => {
      state.status = action.payload;
      if (action.payload === 'connected') state.errorMessage = null;
    },
    realtimeEventReceived: (state, action: PayloadAction<RealtimeEventEnvelope>) => {
      state.events = [action.payload, ...state.events].slice(0, 50);
      if (action.payload.event === 'moderation.queue.changed') {
        const queue = action.payload.payload as RealtimeEventPayloads['moderation.queue.changed'];
        state.moderationQueue = { pendingMedia: queue.pendingMedia, openReports: queue.openReports };
      }
    },
    mediaRoomSelected: (state, action: PayloadAction<string | null>) => {
      state.subscribedMediaItemId = action.payload;
    },
    clearRealtimeError: (state) => { state.errorMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectRealtime.pending, (state) => { state.status = 'connecting'; state.errorMessage = null; })
      .addCase(connectRealtime.rejected, (state, action) => {
        state.status = 'disconnected';
        state.errorMessage = action.payload ?? 'No se pudo iniciar la conexión en tiempo real.';
      })
      .addCase(disconnectRealtime.fulfilled, (state) => {
        state.status = 'disconnected';
        state.subscribedMediaItemId = null;
      })
      .addCase(subscribeToMediaRoom.fulfilled, (state, action) => { state.subscribedMediaItemId = action.payload; })
      .addCase(unsubscribeFromMediaRoom.fulfilled, (state, action) => {
        if (state.subscribedMediaItemId === action.payload) state.subscribedMediaItemId = null;
      });
  },
});

export const { realtimeStatusChanged, realtimeEventReceived, mediaRoomSelected, clearRealtimeError } = realtimeSlice.actions;
