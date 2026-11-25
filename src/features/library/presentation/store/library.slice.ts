import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { describeError } from '../../../../shared/domain/errors';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';

export interface LibraryDependencies {
  getLibrary: { execute: (query: LibraryQuery) => Promise<ActionResult<{ data: LibraryEntryViewModel[]; meta: LibraryState['meta'] }>> };
  getLibraryEntry: { execute: (id: string) => Promise<ActionResult<LibraryEntryViewModel>> };
  getLibraryMediaItemIds: { execute: () => Promise<ActionResult<string[]>> };
  addLibraryEntry: { execute: (params: AddLibraryEntryParams) => Promise<ActionResult<LibraryEntryViewModel>> };
  updateLibraryEntry: { execute: (id: string, changes: LibraryEntryChanges) => Promise<ActionResult<LibraryEntryViewModel>> };
  removeLibraryEntry: { execute: (id: string) => Promise<ActionResult<string>> };
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface LibraryState {
  items: LibraryEntryViewModel[];
  selectedEntry: LibraryEntryViewModel | null;
  existingMediaItemIds: string[];
  existingIdsStatus: RequestStatus;
  query: LibraryQuery;
  meta: { total: number; page: number; limit: number; totalPages: number };
  status: RequestStatus;
  detailStatus: RequestStatus;
  mutationStatus: RequestStatus;
  errorMessage: string | null;
  currentListRequestId: string | null;
}

const initialState: LibraryState = {
  items: [],
  selectedEntry: null,
  existingMediaItemIds: [],
  existingIdsStatus: 'idle',
  query: { page: 1, limit: 10, sortBy: 'addedAt', order: 'DESC' },
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  status: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  errorMessage: null,
  currentListRequestId: null,
};

const createLibraryThunk = createAsyncThunk.withTypes<{
  state: { library: LibraryState };
  extra: { library: LibraryDependencies };
  rejectValue: string;
}>();

export const fetchLibrary = createLibraryThunk(
  'library/fetchAll',
  async (query: LibraryQuery, { extra, rejectWithValue }) => {
    try {
      const response = await extra.library.getLibrary.execute(query);
      if (!response.ok) return rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo cargar la biblioteca.'),
      );
    }
  },
);

export const fetchLibraryEntry = createLibraryThunk(
  'library/fetchEntry',
  async (id: string, { extra, rejectWithValue }) => {
    try {
      const response = await extra.library.getLibraryEntry.execute(id);
      if (!response.ok) return rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo cargar el detalle.'),
      );
    }
  },
);

export const fetchLibraryMediaItemIds = createLibraryThunk(
  'library/fetchMediaItemIds',
  async (_: void, { extra, rejectWithValue }) => {
    try {
      const response = await extra.library.getLibraryMediaItemIds.execute();
      if (!response.ok) return rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudo consultar la biblioteca actual.'));
    }
  },
);

export const addLibraryEntry = createLibraryThunk(
  'library/addEntry',
  async (params: AddLibraryEntryParams, { extra, rejectWithValue }) => {
    try {
      const response = await extra.library.addLibraryEntry.execute(params);
      if (!response.ok) return rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo agregar el elemento.'),
      );
    }
  },
);

export const updateLibraryEntry = createLibraryThunk(
  'library/updateEntry',
  async (
    { id, changes }: { id: string; changes: LibraryEntryChanges },
    { extra, rejectWithValue },
  ) => {
    try {
      const response = await extra.library.updateLibraryEntry.execute(id, changes);
      if (!response.ok) return rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo actualizar la entrada.'),
      );
    }
  },
);

export const removeLibraryEntry = createLibraryThunk(
  'library/removeEntry',
  async (id: string, { extra, rejectWithValue }) => {
    try {
      const response = await extra.library.removeLibraryEntry.execute(id);
      if (!response.ok) return rejectWithValue(response.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo eliminar la entrada.'),
      );
    }
  },
);

export const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearLibraryError: (state) => {
      state.errorMessage = null;
    },
    clearSelectedLibraryEntry: (state) => {
      state.selectedEntry = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibrary.pending, (state, action) => {
        state.status = 'loading';
        state.errorMessage = null;
        state.query = action.meta.arg;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
        state.status = 'succeeded';
        state.currentListRequestId = null;
      })
      .addCase(fetchLibrary.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.status = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudo cargar la biblioteca.';
        state.currentListRequestId = null;
      })
      .addCase(fetchLibraryEntry.pending, (state) => {
        state.detailStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(fetchLibraryEntry.fulfilled, (state, action) => {
        state.selectedEntry = action.payload;
        state.detailStatus = 'succeeded';
      })
      .addCase(fetchLibraryEntry.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo cargar el detalle.';
      })
      .addCase(fetchLibraryMediaItemIds.pending, (state) => {
        state.existingIdsStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(fetchLibraryMediaItemIds.fulfilled, (state, action) => {
        state.existingMediaItemIds = action.payload;
        state.existingIdsStatus = 'succeeded';
      })
      .addCase(fetchLibraryMediaItemIds.rejected, (state, action) => {
        state.existingIdsStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo consultar la biblioteca actual.';
      })
      .addCase(addLibraryEntry.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(addLibraryEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = [
          action.payload,
          ...state.items.filter((entry) => entry.id !== action.payload.id),
        ];
        state.meta.total += 1;
      })
      .addCase(addLibraryEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudo agregar el elemento.';
      })
      .addCase(updateLibraryEntry.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(updateLibraryEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.map((entry) =>
          entry.id === action.payload.id ? action.payload : entry,
        );
        if (state.selectedEntry?.id === action.payload.id)
          state.selectedEntry = action.payload;
      })
      .addCase(updateLibraryEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudo actualizar la entrada.';
      })
      .addCase(removeLibraryEntry.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(removeLibraryEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter(
          (entry) => entry.id !== action.payload,
        );
        state.meta.total = Math.max(0, state.meta.total - 1);
        if (state.selectedEntry?.id === action.payload)
          state.selectedEntry = null;
      })
      .addCase(removeLibraryEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudo eliminar la entrada.';
      });
  },
});

export const { clearLibraryError, clearSelectedLibraryEntry } =
  librarySlice.actions;
