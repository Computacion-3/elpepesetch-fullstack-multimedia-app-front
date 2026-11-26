import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { describeError } from '../../../../shared/domain/errors';
import type { ActionResult } from '../../../../shared/domain/action-result';
import type {
  UserListChanges,
  UserListDraft,
} from '../../domain/entities/user-list';
import type { PublicListsQuery } from '../../domain/repositories/user-lists.repository';
import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';
type UserListPage = {
  items: UserListViewModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface UserListsState {
  ownLists: UserListViewModel[];
  publicLists: UserListPage;
  selectedList: UserListViewModel | null;
  ownStatus: Status;
  publicStatus: Status;
  detailStatus: Status;
  mutationStatus: Status;
  errorMessage: string | null;
}

export interface UserListsDependencies {
  listMine: () => Promise<ActionResult<UserListViewModel[]>>;
  listPublic: (query: PublicListsQuery) => Promise<ActionResult<UserListPage>>;
  getById: (id: string) => Promise<ActionResult<UserListViewModel>>;
  create: (draft: UserListDraft) => Promise<ActionResult<UserListViewModel>>;
  update: (
    id: string,
    changes: UserListChanges,
  ) => Promise<ActionResult<UserListViewModel>>;
  remove: (id: string) => Promise<ActionResult<string>>;
  addItem: (
    listId: string,
    mediaItemId: string,
  ) => Promise<ActionResult<UserListViewModel>>;
  removeItem: (
    listId: string,
    mediaItemId: string,
  ) => Promise<ActionResult<string>>;
}

const emptyPage: UserListPage = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};
const initialState: UserListsState = {
  ownLists: [],
  publicLists: emptyPage,
  selectedList: null,
  ownStatus: 'idle',
  publicStatus: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  errorMessage: null,
};

const createUserListsThunk = createAsyncThunk.withTypes<{
  extra: { userLists: UserListsDependencies };
  rejectValue: string;
}>();

async function dataOrError<T>(
  action: () => Promise<ActionResult<T>>,
  fallback: string,
): Promise<T> {
  try {
    const result = await action();
    if (!result.ok) throw new Error(result.message);
    return result.data;
  } catch (error) {
    throw new Error(describeError(error, fallback));
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error
    ? error.message
    : describeError(error, fallback);
}

export const fetchMyLists = createUserListsThunk<UserListViewModel[], void>(
  'userLists/fetchMyLists',
  async (_, { extra, rejectWithValue }) => {
    try {
      return await dataOrError(
        extra.userLists.listMine,
        'No se pudieron cargar tus listas.',
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'No se pudieron cargar tus listas.'),
      );
    }
  },
);
export const fetchPublicLists = createUserListsThunk<
  UserListPage,
  PublicListsQuery
>('userLists/fetchPublicLists', async (query, { extra, rejectWithValue }) => {
  try {
    return await dataOrError(
      () => extra.userLists.listPublic(query),
      'No se pudieron cargar las listas públicas.',
    );
  } catch (error) {
    return rejectWithValue(
      errorMessage(error, 'No se pudieron cargar las listas públicas.'),
    );
  }
});
export const fetchUserList = createUserListsThunk<UserListViewModel, string>(
  'userLists/fetchUserList',
  async (id, { extra, rejectWithValue }) => {
    try {
      return await dataOrError(
        () => extra.userLists.getById(id),
        'No se pudo cargar la lista.',
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'No se pudo cargar la lista.'),
      );
    }
  },
);
export const createUserList = createUserListsThunk<
  UserListViewModel,
  UserListDraft
>('userLists/create', async (draft, { extra, rejectWithValue }) => {
  try {
    return await dataOrError(
      () => extra.userLists.create(draft),
      'No se pudo crear la lista.',
    );
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'No se pudo crear la lista.'));
  }
});
export const updateUserList = createUserListsThunk<
  UserListViewModel,
  { id: string; changes: UserListChanges }
>('userLists/update', async ({ id, changes }, { extra, rejectWithValue }) => {
  try {
    return await dataOrError(
      () => extra.userLists.update(id, changes),
      'No se pudo actualizar la lista.',
    );
  } catch (error) {
    return rejectWithValue(
      errorMessage(error, 'No se pudo actualizar la lista.'),
    );
  }
});
export const deleteUserList = createUserListsThunk<string, string>(
  'userLists/delete',
  async (id, { extra, rejectWithValue }) => {
    try {
      return await dataOrError(
        () => extra.userLists.remove(id),
        'No se pudo eliminar la lista.',
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'No se pudo eliminar la lista.'),
      );
    }
  },
);
export const addItemToList = createUserListsThunk<
  UserListViewModel,
  { listId: string; mediaItemId: string }
>(
  'userLists/addItem',
  async ({ listId, mediaItemId }, { extra, rejectWithValue }) => {
    try {
      return await dataOrError(
        () => extra.userLists.addItem(listId, mediaItemId),
        'No se pudo agregar el medio.',
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'No se pudo agregar el medio.'),
      );
    }
  },
);
export const removeItemFromList = createUserListsThunk<
  string,
  { listId: string; mediaItemId: string }
>(
  'userLists/removeItem',
  async ({ listId, mediaItemId }, { extra, rejectWithValue }) => {
    try {
      return await dataOrError(
        () => extra.userLists.removeItem(listId, mediaItemId),
        'No se pudo quitar el medio.',
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'No se pudo quitar el medio.'),
      );
    }
  },
);

export const userListsSlice = createSlice({
  name: 'userLists',
  initialState,
  reducers: {
    clearUserListsError: (state) => {
      state.errorMessage = null;
    },
    clearSelectedUserList: (state) => {
      state.selectedList = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLists.pending, (state) => {
        state.ownStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(fetchMyLists.fulfilled, (state, action) => {
        state.ownStatus = 'succeeded';
        state.ownLists = action.payload;
      })
      .addCase(fetchMyLists.rejected, (state, action) => {
        state.ownStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudieron cargar tus listas.';
      })
      .addCase(fetchPublicLists.pending, (state) => {
        state.publicStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(fetchPublicLists.fulfilled, (state, action) => {
        state.publicStatus = 'succeeded';
        state.publicLists = action.payload;
      })
      .addCase(fetchPublicLists.rejected, (state, action) => {
        state.publicStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudieron cargar las listas públicas.';
      })
      .addCase(fetchUserList.pending, (state) => {
        state.detailStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(fetchUserList.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedList = action.payload;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo cargar la lista.';
      })
      .addCase(createUserList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(createUserList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.ownLists = [action.payload, ...state.ownLists];
      })
      .addCase(createUserList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo crear la lista.';
      })
      .addCase(updateUserList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(updateUserList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.ownLists = state.ownLists.map((list) =>
          list.id === action.payload.id ? action.payload : list,
        );
        if (state.selectedList?.id === action.payload.id)
          state.selectedList = action.payload;
      })
      .addCase(updateUserList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage =
          action.payload ?? 'No se pudo actualizar la lista.';
      })
      .addCase(deleteUserList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(deleteUserList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.ownLists = state.ownLists.filter(
          (list) => list.id !== action.payload,
        );
        if (state.selectedList?.id === action.payload)
          state.selectedList = null;
      })
      .addCase(deleteUserList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo eliminar la lista.';
      })
      .addCase(addItemToList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(addItemToList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.ownLists = state.ownLists.map((list) =>
          list.id === action.payload.id ? action.payload : list,
        );
        if (state.selectedList?.id === action.payload.id)
          state.selectedList = action.payload;
      })
      .addCase(addItemToList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo agregar el medio.';
      })
      .addCase(removeItemFromList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(removeItemFromList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const remove = (list: UserListViewModel) =>
          list.id === action.meta.arg.listId
            ? {
                ...list,
                items: list.items.filter((item) => item.id !== action.payload),
              }
            : list;
        state.ownLists = state.ownLists.map(remove);
        if (state.selectedList) state.selectedList = remove(state.selectedList);
      })
      .addCase(removeItemFromList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo quitar el medio.';
      });
  },
});

export const { clearUserListsError, clearSelectedUserList } =
  userListsSlice.actions;
