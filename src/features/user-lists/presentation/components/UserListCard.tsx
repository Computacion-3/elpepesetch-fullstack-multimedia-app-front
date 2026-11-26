import Link from 'next/link';
import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';

export function UserListCard({
  list,
  onEdit,
  onDelete,
}: {
  list: UserListViewModel;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#241f42] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">
            <Link
              className="hover:text-[#3fd0c0] focus-visible:outline-2 focus-visible:outline-[#3fd0c0]"
              href={`/lists/${list.id}`}
            >
              {list.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-[#c2bddc]">
            Por {list.owner.username}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-xs">
          {list.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
        </span>
      </div>
      <p className="min-h-10 line-clamp-2 text-sm text-[#c2bddc]">
        {list.description || 'Sin descripción.'}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-sm text-[#c2bddc]">
        <span>
          {list.items.length} {list.items.length === 1 ? 'medio' : 'medios'}
        </span>
        <time dateTime={list.updatedAt}>
          Actualizada{' '}
          {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(
            new Date(list.updatedAt),
          )}
        </time>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex gap-2 border-t border-white/10 pt-3">
          {onEdit && (
            <button
              type="button"
              className="min-h-10 rounded-lg border border-white/20 px-3 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#3fd0c0]"
              onClick={onEdit}
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="min-h-10 rounded-lg border border-red-300/40 px-3 text-sm font-semibold text-red-200 hover:bg-red-300/10 focus-visible:outline-2 focus-visible:outline-red-200"
              onClick={onDelete}
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </article>
  );
}
