import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { describeError } from '@/src/shared/domain/errors';
import type { Create__Feature__Params } from '../../domain/repositories/__feature-kebab__.repository';
import type { Create__Feature__UseCase } from '../../domain/usecases/create-__feature-kebab__.usecase';
import type { Get__Features__UseCase } from '../../domain/usecases/get-__features-kebab__.usecase';
import { __Feature__ViewModelMapper } from '../viewmodels/__feature-kebab__.viewmodel';
import type { __Feature__ItemViewModel } from '../viewmodels/__feature-kebab__.viewmodel';

/**
 * What the thunks need from the outside world, expressed with DOMAIN types only.
 * src/store/store.ts injects the real use cases (from di/) as the thunk extraArgument,
 * so this file never imports the container or any infrastructure.
 */
export interface __Features__Dependencies {
    get__Features__: Pick<Get__Features__UseCase, 'execute'>;
    create__Feature__: Pick<Create__Feature__UseCase, 'execute'>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface __Features__State {
    items: __Feature__ItemViewModel[];
    status: RequestStatus;
    mutationStatus: RequestStatus;
    errorMessage: string | null;
}

const initialState: __Features__State = {
    items: [],
    status: 'idle',
    mutationStatus: 'idle',
    errorMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { __features__: __Features__State };
    extra: { __features__: __Features__Dependencies };
    rejectValue: string;
}>();

/** Query: delegates to Get__Features__UseCase and maps entities to view models. */
export const fetch__Features__ = createAppThunk(
    '__features__/fetchAll',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            const entities = await extra.__features__.get__Features__.execute();
            return entities.map((entity) => __Feature__ViewModelMapper.toViewModel(entity));
        } catch (err) {
            return rejectWithValue(describeError(err, 'Could not load __features__.'));
        }
    },
    // Avoid duplicate requests while one is in flight.
    { condition: (_, { getState }) => getState().__features__.status !== 'loading' },
);

/** Mutation: pessimistic update, the item is added only after the use case succeeds. */
export const create__Feature__Mutation = createAppThunk(
    '__features__/create',
    async (params: Create__Feature__Params, { extra, rejectWithValue }) => {
        try {
            const entity = await extra.__features__.create__Feature__.execute(params);
            return __Feature__ViewModelMapper.toViewModel(entity);
        } catch (err) {
            return rejectWithValue(describeError(err, 'Could not create the __feature__.'));
        }
    },
);

export const __features__Slice = createSlice({
    name: '__features__',
    initialState,
    reducers: {
        clearError: (state) => {
            state.errorMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetch__Features__.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetch__Features__.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetch__Features__.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? 'Could not load __features__.';
            });

        builder
            .addCase(create__Feature__Mutation.pending, (state) => {
                state.mutationStatus = 'loading';
                state.errorMessage = null;
            })
            .addCase(create__Feature__Mutation.fulfilled, (state, action) => {
                state.mutationStatus = 'succeeded';
                state.items.unshift(action.payload);
            })
            .addCase(create__Feature__Mutation.rejected, (state, action) => {
                state.mutationStatus = 'failed';
                state.errorMessage = action.payload ?? 'Could not create the __feature__.';
            });
    },
});

export const { clearError: clear__Features__Error } = __features__Slice.actions;
