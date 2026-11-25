import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type { MediaApprovalDraft, MediaItemChanges, MediaItemDraft, MediaQuery } from '../../domain/entities/media-item';
import type { MediaItemViewModel, MediaPageViewModel } from '../viewmodels/media.viewmodel';

/** Dependencias externas inyectadas por el store: solo Server Actions serializables. */
export interface MediaDependencies {
    list: (query: MediaQuery) => Promise<ActionResult<MediaPageViewModel>>;
    listPending: (query: MediaQuery) => Promise<ActionResult<MediaPageViewModel>>;
    getById: (id: string) => Promise<ActionResult<MediaItemViewModel>>;
    create: (draft: MediaItemDraft) => Promise<ActionResult<MediaItemViewModel>>;
    update: (id: string, changes: MediaItemChanges) => Promise<ActionResult<MediaItemViewModel>>;
    setApproval: (id: string, draft: MediaApprovalDraft) => Promise<ActionResult<MediaItemViewModel>>;
}

export type MediaRequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** Estado de catálogo, detalle y moderación; Redux conserva únicamente view models. */
export interface MediaState {
    items: MediaItemViewModel[];
    selectedItem: MediaItemViewModel | null;
    pendingItems: MediaItemViewModel[];
    query: MediaQuery;
    meta: { total: number; page: number; limit: number; totalPages: number };
    pendingMeta: { total: number; page: number; limit: number; totalPages: number };
    listStatus: MediaRequestStatus;
    detailStatus: MediaRequestStatus;
    pendingStatus: MediaRequestStatus;
    mutationStatus: MediaRequestStatus;
    errorMessage: string | null;
}

const EMPTY_META = { total: 0, page: 1, limit: 12, totalPages: 0 };

const initialState: MediaState = {
    items: [],
    selectedItem: null,
    pendingItems: [],
    query: { page: 1, limit: 12, sortBy: 'title', order: 'ASC' },
    meta: EMPTY_META,
    pendingMeta: EMPTY_META,
    listStatus: 'idle',
    detailStatus: 'idle',
    pendingStatus: 'idle',
    mutationStatus: 'idle',
    errorMessage: null,
};

/** Los thunks reciben Server Actions por extraArgument; no conocen HTTP ni contenedores. */
const createMediaThunk = createAsyncThunk.withTypes<{
    state: { media: MediaState };
    extra: { media: MediaDependencies };
    rejectValue: string;
}>();

export const fetchMedia = createMediaThunk(
    'media/list',
    async (query: MediaQuery, { extra, rejectWithValue }) => {
        try {
            const result = await extra.media.list(query);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo cargar el catálogo'));
        }
    },
);

export const fetchPendingMedia = createMediaThunk(
    'media/listPending',
    async (query: MediaQuery, { extra, rejectWithValue }) => {
        try {
            const result = await extra.media.listPending(query);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudieron cargar las propuestas'));
        }
    },
);

export const fetchMediaItem = createMediaThunk(
    'media/getById',
    async (id: string, { extra, rejectWithValue }) => {
        try {
            const result = await extra.media.getById(id);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo cargar el detalle'));
        }
    },
);

export const createMediaItem = createMediaThunk(
    'media/create',
    async (draft: MediaItemDraft, { extra, rejectWithValue }) => {
        try {
            const result = await extra.media.create(draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo enviar la propuesta'));
        }
    },
);

export const updateMediaItem = createMediaThunk(
    'media/update',
    async (input: { id: string; changes: MediaItemChanges }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.media.update(input.id, input.changes);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo actualizar la propuesta'));
        }
    },
);

export const setMediaApproval = createMediaThunk(
    'media/setApproval',
    async (input: { id: string; decision: MediaApprovalDraft }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.media.setApproval(input.id, input.decision);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo guardar la decisión'));
        }
    },
);

export const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        /** Al cambiar un filtro se vuelve a la primera página para evitar páginas vacías. */
        setMediaQuery: (state, action: PayloadAction<Partial<MediaQuery>>) => {
            state.query = { ...state.query, ...action.payload, page: action.payload.page ?? 1 };
        },
        clearSelectedMedia: (state) => {
            state.selectedItem = null;
            state.detailStatus = 'idle';
        },
        clearMediaError: (state) => {
            state.errorMessage = null;
            if (state.listStatus === 'failed') state.listStatus = 'idle';
            if (state.detailStatus === 'failed') state.detailStatus = 'idle';
            if (state.pendingStatus === 'failed') state.pendingStatus = 'idle';
            if (state.mutationStatus === 'failed') state.mutationStatus = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMedia.pending, (state) => {
                state.listStatus = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchMedia.fulfilled, (state, action) => {
                state.listStatus = 'succeeded';
                state.items = action.payload.items;
                state.meta = {
                    total: action.payload.total,
                    page: action.payload.page,
                    limit: action.payload.limit,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchMedia.rejected, (state, action) => {
                state.listStatus = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            })
            .addCase(fetchPendingMedia.pending, (state) => {
                state.pendingStatus = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchPendingMedia.fulfilled, (state, action) => {
                state.pendingStatus = 'succeeded';
                state.pendingItems = action.payload.items;
                state.pendingMeta = {
                    total: action.payload.total,
                    page: action.payload.page,
                    limit: action.payload.limit,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchPendingMedia.rejected, (state, action) => {
                state.pendingStatus = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            })
            .addCase(fetchMediaItem.pending, (state) => {
                state.detailStatus = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchMediaItem.fulfilled, (state, action) => {
                state.detailStatus = 'succeeded';
                state.selectedItem = action.payload;
            })
            .addCase(fetchMediaItem.rejected, (state, action) => {
                state.detailStatus = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        // Las mutaciones guardan estado y error; el hook recarga tras el éxito del servidor.
        for (const mutation of [createMediaItem, updateMediaItem, setMediaApproval]) {
            builder
                .addCase(mutation.pending, (state) => {
                    state.mutationStatus = 'loading';
                    state.errorMessage = null;
                })
                .addCase(mutation.fulfilled, (state) => {
                    state.mutationStatus = 'succeeded';
                })
                .addCase(mutation.rejected, (state, action) => {
                    state.mutationStatus = 'failed';
                    state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
                });
        }
    },
});

export const { setMediaQuery, clearSelectedMedia, clearMediaError } = mediaSlice.actions;
