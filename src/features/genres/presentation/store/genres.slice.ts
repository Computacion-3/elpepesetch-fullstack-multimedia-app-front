import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type { GenreChanges, GenreDraft } from '../../domain/entities/genre';
import type { GenreViewModel } from '../viewmodels/genre.viewmodel';

/** Server Actions que el store inyecta para lectura y escritura de géneros. */
export interface GenresDependencies {
    list: () => Promise<ActionResult<GenreViewModel[]>>;
    create: (draft: GenreDraft) => Promise<ActionResult<GenreViewModel>>;
    update: (id: string, changes: GenreChanges) => Promise<ActionResult<GenreViewModel>>;
    remove: (id: string) => Promise<ActionResult<null>>;
}

export type GenresRequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** Estado sencillo para la lista de géneros y su mutación activa. */
export interface GenresState {
    items: GenreViewModel[];
    status: GenresRequestStatus;
    mutationStatus: GenresRequestStatus;
    errorMessage: string | null;
}

const initialState: GenresState = {
    items: [],
    status: 'idle',
    mutationStatus: 'idle',
    errorMessage: null,
};

/** Los thunks no conocen transporte ni contenedor; reciben Server Actions por extraArgument. */
const createGenresThunk = createAsyncThunk.withTypes<{
    state: { genres: GenresState };
    extra: { genres: GenresDependencies };
    rejectValue: string;
}>();

export const fetchGenres = createGenresThunk(
    'genres/list',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            const result = await extra.genres.list();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudieron cargar los géneros'));
        }
    },
);

export const createGenre = createGenresThunk(
    'genres/create',
    async (draft: GenreDraft, { extra, rejectWithValue }) => {
        try {
            const result = await extra.genres.create(draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo crear el género'));
        }
    },
);

export const updateGenre = createGenresThunk(
    'genres/update',
    async (input: { id: string; changes: GenreChanges }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.genres.update(input.id, input.changes);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo actualizar el género'));
        }
    },
);

export const deleteGenre = createGenresThunk(
    'genres/delete',
    async (id: string, { extra, rejectWithValue }) => {
        try {
            const result = await extra.genres.remove(id);
            if (!result.ok) return rejectWithValue(result.message);
            return id;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo eliminar el género'));
        }
    },
);

export const genresSlice = createSlice({
    name: 'genres',
    initialState,
    reducers: {
        clearGenresError: (state) => {
            state.errorMessage = null;
            if (state.status === 'failed') state.status = 'idle';
            if (state.mutationStatus === 'failed') state.mutationStatus = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGenres.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchGenres.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchGenres.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        // El hook vuelve a consultar la lista tras cada escritura confirmada por el servidor.
        for (const mutation of [createGenre, updateGenre, deleteGenre]) {
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

export const { clearGenresError } = genresSlice.actions;
