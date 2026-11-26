'use client';

import { useEffect, useState } from 'react';
import { useReviews } from '@/src/features/reviews/presentation/hooks/use-reviews';
import { ReviewCard } from '@/src/features/reviews/presentation/components/ReviewCard';
import { ReviewForm } from '@/src/features/reviews/presentation/components/ReviewForm';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Modal } from '@/src/shared/ui/Modal';
import { Pagination } from '@/src/shared/ui/Pagination';

/** Muestra reseñas del detalle y reutiliza las operaciones del módulo de comunidad. */
export function MediaReviewsPanel({
  mediaItemId,
  canCreate,
}: {
  mediaItemId: string;
  canCreate: boolean;
}) {
  const {
    selectMedia,
    selectedMediaId,
    loadReviews,
    page,
    clearFeedback,
    errorMessage,
    successMessage,
    isLoading,
    reviews,
    changePage,
  } = useReviews();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    selectMedia(mediaItemId);
  }, [mediaItemId, selectMedia]);

  useEffect(() => {
    if (selectedMediaId === mediaItemId) {
      void loadReviews(mediaItemId, page.page);
    }
  }, [loadReviews, mediaItemId, page.page, selectedMediaId]);

  function openForm() {
    clearFeedback();
    setFormOpen(true);
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="media-reviews-title">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="media-reviews-title" className="text-2xl font-semibold">Reseñas</h2>
          <p className="text-sm text-muted">{page.total} reseñas de la comunidad</p>
        </div>
        {canCreate && <Button type="button" onClick={openForm}>Escribir reseña</Button>}
      </header>

      {errorMessage && !formOpen && <Alert variant="error">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {isLoading && reviews.length === 0 ? (
        <p role="status" className="text-sm">Cargando reseñas…</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-surface p-4 text-sm text-muted">
          Aún no hay reseñas visibles para este elemento multimedia.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canEdit={false}
              canDelete={false}
              canReport={false}
              onEdit={() => undefined}
              onDelete={() => undefined}
              onReport={() => undefined}
            />
          ))}
        </div>
      )}

      {page.totalPages > 1 && (
        <Pagination
          page={page.page}
          totalPages={page.totalPages}
          onChange={changePage}
        />
      )}

      <Modal open={formOpen} title="Escribir reseña" onClose={() => setFormOpen(false)}>
        <ReviewForm mediaItemId={mediaItemId} onDone={() => setFormOpen(false)} />
      </Modal>
    </section>
  );
}
