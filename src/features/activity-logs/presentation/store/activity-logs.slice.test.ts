import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { activityLogsSlice, activityArrived, fetchActivityPage, type ActivityLogsState } from './activity-logs.slice';

describe('activityLogsSlice', () => {
  it('tracks newly arrived events until page one is refreshed', () => {
    let state = activityLogsSlice.reducer(undefined, activityArrived());
    assert.equal(state.hasNewActivities, true);
    state = activityLogsSlice.reducer(state, fetchActivityPage.pending('request', { page: 1, limit: 10 }));
    state = activityLogsSlice.reducer(state, fetchActivityPage.fulfilled({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }, 'request', { page: 1, limit: 10 }));
    assert.equal(state.hasNewActivities, false);
  });

  it('does not replace data with a stale request result', () => {
    let state: ActivityLogsState = { ...activityLogsSlice.getInitialState(), currentRequestId: 'new-request' };
    state = activityLogsSlice.reducer(state, fetchActivityPage.fulfilled({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }, 'old-request', { page: 1, limit: 10 }));
    assert.equal(state.currentRequestId, 'new-request');
  });
});
