# Redux Toolkit in Clean Architecture (RTK 2.x, react-redux 9.x, Next.js App Router)

Verify current APIs with Context7 before planning (`@reduxjs/toolkit`, `react-redux`). Patterns below were
validated with RTK 2.13.0, react-redux 9.3.0 and Next.js 16.4.2 (`cacheComponents: true`).

## Data flow

```
Component ──(intent)──▶ facade hook ──dispatch──▶ thunk ──extra.<feature>.<useCase>.execute()──▶ domain
    ▲                         │                      │                                          │
    └──── view models ◀── selectors ◀── reducer ◀── fulfilled(viewModels) ◀── entities ─────────┘
```

## 1. Store: factory + thunk extraArgument (src/store/store.ts)

```ts
const rootReducer = combineSlices(routinesSlice /*, authSlice, … */);

function createThunkExtra() {
  return {
    routines: createRoutineContainer() satisfies RoutinesDependencies,
  };
}

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (gDM) => gDM({ thunk: { extraArgument: createThunkExtra() } }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
```

- **Factory, not singleton**: a module-level store would be shared between concurrent server requests.
- **extraArgument instead of importing `di/` in the slice**: presentation depends only on domain types; tests
  can pass fakes (`makeStore` variant or `configureStore` with a fake extra).
- `satisfies <Feature>Dependencies` makes TypeScript check that the container provides what thunks expect.
- Keep the `<clean:imports>`, `<clean:slices>`, `<clean:extra>` marker comments: `scaffold.mjs` wires new features there.

## 2. Slice with typed thunks

```ts
export interface RoutinesDependencies {
  getRoutines: Pick<GetRoutinesUseCase, 'execute'>;
  createRoutine: Pick<CreateRoutineUseCase, 'execute'>;
}

const createAppThunk = createAsyncThunk.withTypes<{
  state: { routines: RoutinesState };     // only what this slice needs: no RootState import, no cycles
  extra: { routines: RoutinesDependencies };
  rejectValue: string;                     // action.payload is string on rejected — no casts
}>();

export const fetchRoutines = createAppThunk(
  'routines/fetchAll',
  async (_: void, { extra, rejectWithValue }) => {
    try {
      const entities = await extra.routines.getRoutines.execute();
      return entities.map(RoutineViewModelMapper.toViewModel);
    } catch (err) {
      return rejectWithValue(describeError(err, 'Could not load routines.'));
    }
  },
  { condition: (_, { getState }) => getState().routines.status !== 'loading' },
);
```

Rules:
- Action types `feature/action` (`routines/fetchAll`, `routines/create`).
- State uses `status: 'idle' | 'loading' | 'succeeded' | 'failed'` (+ `mutationStatus` for writes), **not**
  `isLoading` + "fetch if empty": an empty result would refetch forever.
- Store **view models** (plain objects, ISO strings), never entities or `Date` instances.
- Pessimistic updates by default (insert on `fulfilled`). Optimistic only when the developer asks; then plan
  the rollback in `rejected` and keep a temp id.
- Synchronous UI actions (`clearError`, filters) go in `reducers`; thunk lifecycles in `extraReducers` with the builder.
- Domain validation errors reach the UI as `rejectWithValue(err.message)` (via `describeError`).

## 3. Selectors (presentation/store/<feature>.selectors.ts)

Typed against `{ <feature>: State }`. Use `createSelector` only for derived values that allocate new
arrays/objects (filter/sort/map), to keep referential stability.

## 4. Typed hooks (src/store/hooks.ts)

```ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

## 5. Facade hook (presentation/hooks/use-<features>.ts)

- `'use client'`. The only importer of `useAppDispatch`/`useAppSelector` and the slice/selectors.
- Initial load: `useEffect(() => { if (status === 'idle') dispatch(fetchX()); }, [dispatch, status])`.
- Mutations return `Promise<boolean>` using `thunk.fulfilled.match(result)` so forms can reset on success.
- Return a stable, UI-oriented API: `{ items, isLoading, isMutating, errorMessage, reload, clearError, createX }`.

## 6. Provider and layout

- `StoreProvider.tsx` is `'use client'` and creates the store with `useState(makeStore)` (once per client).
- `app/layout.tsx` stays a Server Component and wraps `{children}` with `<StoreProvider>`.
- With `cacheComponents: true`, Client Components are prerendered: anything executed while constructing the
  store (containers, datasources) must be deterministic — no `new Date()`, `Date.now()`, `Math.random()` at
  construction time. Put such calls inside methods (executed in effects/thunks) instead.

## 7. Routes

Prefer `app/<route>/page.tsx` as a Server Component rendering a client screen component from
`presentation/components/`. Only mark the page `'use client'` if it must call the facade hook itself.

## Anti-patterns → rule

| Anti-pattern | Consequence | Rule |
|---|---|---|
| `fetch` / axios in a thunk | Couples UI state to transport | Thunks call use cases from `extra` |
| Slice imports `di/` container | Presentation knows concrete classes; untestable | Inject via thunk `extraArgument` |
| Entities/Date in state | Serialization & hydration errors | Store view models |
| `export const store = configureStore(...)` | Cross-request leaks on the server | `makeStore()` factory |
| `useSelector`/`useDispatch` in components | UI coupled to Redux | Components use the facade hook |
| Fetch when `items.length === 0` | Infinite refetch on empty data | `status === 'idle'` |
| Validation duplicated in the form | Rules drift apart | Entity/use case validates; UI shows the error |
| `action.payload as string` | Unsafe casts | `rejectValue: string` in `withTypes` |
