'use client';

import { useReviews } from '../hooks/use-reviews';
import { ReviewForm } from './ReviewForm';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';

/** Lista reseñas visibles y ofrece creación a usuarios con permiso. */
export function ReviewsPanel({ mediaItemId, canCreate }: { mediaItemId: string; canCreate: boolean }) {
  const reviews = useReviews(mediaItemId);

  return (
    <section className="space-y-5" aria-labelledby="reviews-title">
      <header className="flex items-baseline justify-between gap-3">
        <h2 id="reviews-title" className="text-2xl font-bold">Reseñas</h2>
        <span className="text-sm text-gray-500">{reviews.meta.total} en total</span>
      </header>

      {reviews.errorMessage && <Alert variant="error">{reviews.errorMessage}</Alert>}
      {reviews.status === 'loading' && <p role="status">Cargando reseñas…</p>}
      {reviews.status === 'succeeded' && reviews.items.length === 0 && <p className="text-sm text-gray-500">Todavía no hay reseñas para este elemento.</p>}

      <ul className="space-y-3">
        {reviews.items.map((review) => (
          <li key={review.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{review.title || 'Reseña'}</h3>
              <span className="text-xs text-gray-500">{review.dateLabel}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">Por {review.user.username}</p>
            <p className="mt-3 whitespace-pre-wrap">{review.content}</p>
            {review.isHidden && <p className="mt-3 text-sm text-amber-700">Oculta: {review.hiddenReason || 'sin motivo informado'}</p>}
          </li>
        ))}
      </ul>

      {reviews.meta.totalPages > 1 && (
        <nav className="flex items-center justify-end gap-3" aria-label="Paginación de reseñas">
          <Button variant="secondary" className="px-3 py-1.5" type="button" disabled={reviews.meta.page <= 1} onClick={() => reviews.load({ page: reviews.meta.page - 1, limit: reviews.meta.limit })}>Anterior</Button>
          <span className="text-sm">Página {reviews.meta.page} de {reviews.meta.totalPages}</span>
          <Button variant="secondary" className="px-3 py-1.5" type="button" disabled={reviews.meta.page >= reviews.meta.totalPages} onClick={() => reviews.load({ page: reviews.meta.page + 1, limit: reviews.meta.limit })}>Siguiente</Button>
        </nav>
      )}

      {canCreate && <ReviewForm busy={reviews.mutationStatus === 'loading'} onSubmit={reviews.create} />}
    </section>
  );
}
