import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { describeError } from '../../../../shared/domain/errors';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import type { GetLibraryUseCase } from '../../domain/usecases/get-library.usecase';
import type { GetLibraryEntryUseCase } from '../../domain/usecases/get-library-entry.usecase';
import type { AddLibraryEntryUseCase } from '../../domain/usecases/add-library-entry.usecase';
import type { UpdateLibraryEntryUseCase } from '../../domain/usecases/update-library-entry.usecase';
import type { RemoveLibraryEntryUseCase } from '../../domain/usecases/remove-library-entry.usecase';
import type { GetLibraryMediaOptionsUseCase } from '../../domain/usecases/get-library-media-options.usecase';
import {
  LibraryEntryViewModelMapper,
  LibraryMediaOptionViewModelMapper,
} from '../viewmodels/library-entry.viewmodel';
import type {
  LibraryEntryViewModel,
  LibraryMediaOptionViewModel,
} from '../viewmodels/library-entry.viewmodel';

export interface LibraryDependencies {
  getLibrary: Pick<GetLibraryUseCase, 'execute'>;
  getLibraryEntry: Pick<GetLibraryEntryUseCase, 'execute'>;
  addLibraryEntry: Pick<AddLibraryEntryUseCase, 'execute'>;
  updateLibraryEntry: Pick<UpdateLibraryEntryUseCase, 'execute'>;
  removeLibraryEntry: Pick<RemoveLibraryEntryUseCase, 'execute'>;
  getLibraryMediaOptions: Pick<GetLibraryMediaOptionsUseCase, 'execute'>;
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
      const result = await extra.library.getLibrary.execute(query);
      return {
        ...result,
        data: result.data.map(LibraryEntryViewModelMapper.toViewModel),
      };
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
      const entry = await extra.library.getLibraryEntry.execute(id);
      return LibraryEntryViewModelMapper.toViewModel(entry);
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
      const options = await extra.library.getLibraryMediaOptions.execute();
      return options.map(LibraryMediaOptionViewModelMapper.toViewModel);
    } catch (error) {
      return rejectWithValue(
        describeError(error, 'No se pudo cargar el catálogo de ejemplo.'),
      );
    }
  },
);

export const addLibraryEntry = createLibraryThunk(
  'library/addEntry',
  async (params: AddLibraryEntryParams, { extra, rejectWithValue }) => {
    try {
      const entry = await extra.library.addLibraryEntry.execute(params);
      return LibraryEntryViewModelMapper.toViewModel(entry);
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
      const entry = await extra.library.updateLibraryEntry.execute(id, changes);
      return LibraryEntryViewModelMapper.toViewModel(entry);
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
      await extra.library.removeLibraryEntry.execute(id);
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
