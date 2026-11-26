import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';

const labels = { GAME: 'Videojuego', MOVIE: 'Película', BOOK: 'Libro' };

export function UserListItems({
  list,
  editable,
  loading,
  onRemove,
}: {
  list: UserListViewModel;
  editable: boolean;
  loading: boolean;
  onRemove: (mediaItemId: string) => void;
}) {
  if (!list.items.length)
    return (
      <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-sm text-[#c2bddc]">
        Esta lista todavía no tiene medios.
      </p>
    );
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {list.items.map((item) => (
        <li
          key={item.id}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#241f42] p-3"
        >
          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={`Portada de ${item.title}`}
              className="size-16 rounded-lg object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-16 shrink-0 place-items-center rounded-lg bg-white/10 text-xl font-bold"
            >
              {item.title.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{item.title}</p>
            <p className="truncate text-sm text-[#c2bddc]">
              {labels[item.type]} · {item.creator} · {item.releaseYear}
            </p>
          </div>
          {editable && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onRemove(item.id)}
              aria-label={`Quitar ${item.title} de la lista`}
              className="min-h-10 rounded-lg border border-white/20 px-3 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#3fd0c0] disabled:opacity-50"
            >
              Quitar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
