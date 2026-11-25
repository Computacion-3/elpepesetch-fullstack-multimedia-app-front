import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { describeError } from '../../../../shared/domain/errors';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type {
  LibraryEntryViewModel,
  LibraryMediaOptionViewModel,
} from '../viewmodels/library-entry.viewmodel';

export interface LibraryDependencies {
  getLibrary: (query: LibraryQuery) => Promise<ActionResult<{ data: LibraryEntryViewModel[]; meta: LibraryState['meta'] }>>;
  getLibraryEntry: (id: string) => Promise<ActionResult<LibraryEntryViewModel>>;
  addLibraryEntry: (params: AddLibraryEntryParams) => Promise<ActionResult<LibraryEntryViewModel>>;
  updateLibraryEntry: (id: string, changes: LibraryEntryChanges) => Promise<ActionResult<LibraryEntryViewModel>>;
  removeLibraryEntry: (id: string) => Promise<ActionResult<null>>;
  getLibraryMediaOptions: () => Promise<ActionResult<LibraryMediaOptionViewModel[]>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface LibraryState {
  items: LibraryEntryViewModel[];
  selectedEntry: LibraryEntryViewModel | null;
  mediaOptions: LibraryMediaOptionViewModel[];
  query: LibraryQuery;
  meta: { total: number; page: number; limit: number; totalPages: number };
  status: RequestStatus;
  detailStatus: RequestStatus;
  optionsStatus: RequestStatus;
  mutationStatus: RequestStatus;
  errorMessage: string | null;
  currentListRequestId: string | null;
}

const initialState: LibraryState = {
  items: [],
  selectedEntry: null,
  mediaOptions: [],
  query: { page: 1, limit: 10, sortBy: 'addedAt', order: 'DESC' },
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  status: 'idle',
  detailStatus: 'idle',
  optionsStatus: 'idle',
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
      const result = await extra.library.getLibrary(query);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
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
      const result = await extra.library.getLibraryEntry(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo cargar el detalle.'),
      );
    }
  },
);

export const fetchLibraryMediaOptions = createLibraryThunk(
  'library/fetchMediaOptions',
  async (_: void, { extra, rejectWithValue }) => {
    try {
      const result = await extra.library.getLibraryMediaOptions();
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo cargar el catálogo multimedia.'),
      );
    }
  },
);

export const addLibraryEntry = createLibraryThunk(
  'library/addEntry',
  async (params: AddLibraryEntryParams, { extra, rejectWithValue }) => {
    try {
      const result = await extra.library.addLibraryEntry(params);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
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
      const result = await extra.library.updateLibraryEntry(id, changes);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
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
      const result = await extra.library.removeLibraryEntry(id);
      if (!result.ok) return rejectWithValue(result.message);
      return id;
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
      .addCase(fetchLibraryMediaOptions.pending, (state) => {
        state.optionsStatus = 'loading';
      })
      .addCase(fetchLibraryMediaOptions.fulfilled, (state, action) => {
        state.mediaOptions = action.payload;
        state.optionsStatus = 'succeeded';
      })
      .addCase(fetchLibraryMediaOptions.rejected, (state, action) => {
        state.optionsStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudo cargar el catálogo de ejemplo.';
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
