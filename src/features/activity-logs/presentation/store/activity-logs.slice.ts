import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '../../../../shared/domain/errors';
import type { ActivityQuery } from '../../domain/entities/activity-log';
import type { ActivityPaginationViewModel } from '../viewmodels/activity-log.viewmodel';

export interface ActivityLogsDependencies {
  getMyActivity: (query: ActivityQuery) => Promise<ActionResult<ActivityPaginationViewModel>>;
}
export type ActivityRequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export interface ActivityLogsState {
  items: ActivityPaginationViewModel['data'];
  meta: ActivityPaginationViewModel['meta'];
  page: number;
  status: ActivityRequestStatus;
  errorMessage: string | null;
  hasNewActivities: boolean;
  currentRequestId: string | null;
}

const initialState: ActivityLogsState = {
  items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 }, page: 1,
  status: 'idle', errorMessage: null, hasNewActivities: false, currentRequestId: null,
};

const createActivityThunk = createAsyncThunk.withTypes<{
  state: { activityLogs: ActivityLogsState };
  extra: { activityLogs: ActivityLogsDependencies };
  rejectValue: string;
}>();

export const fetchActivityPage = createActivityThunk(
  'activityLogs/fetchPage',
  async (query: ActivityQuery, { extra, rejectWithValue }) => {
    try {
      const result = await extra.activityLogs.getMyActivity(query);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudo cargar tu actividad.'));
    }
  },
);

export const activityLogsSlice = createSlice({
  name: 'activityLogs', initialState,
  reducers: {
    activityArrived: (state) => { state.hasNewActivities = true; },
    clearActivityError: (state) => { state.errorMessage = null; },
  },
  extraReducers: (builder) => builder
    .addCase(fetchActivityPage.pending, (state, action) => {
      state.status = 'loading'; state.errorMessage = null; state.currentRequestId = action.meta.requestId;
    })
    .addCase(fetchActivityPage.fulfilled, (state, action) => {
      if (state.currentRequestId !== action.meta.requestId) return;
      state.items = action.payload.data;
      state.meta = action.payload.meta;
      state.page = action.payload.meta.page;
      state.status = 'succeeded';
      state.currentRequestId = null;
      if (action.payload.meta.page === 1) state.hasNewActivities = false;
    })
    .addCase(fetchActivityPage.rejected, (state, action) => {
      if (state.currentRequestId !== action.meta.requestId) return;
      state.status = 'failed';
      state.errorMessage = action.payload ?? action.error.message ?? 'No se pudo cargar tu actividad.';
      state.currentRequestId = null;
    }),
});

export const { activityArrived, clearActivityError } = activityLogsSlice.actions;

