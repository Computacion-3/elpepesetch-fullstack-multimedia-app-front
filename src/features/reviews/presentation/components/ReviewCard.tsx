'use client';

import { Button } from '@/src/shared/ui/Button';
import type { ReviewViewModel } from '../viewmodels/reviews.viewmodel';

type ReviewCardProps = {
    /** Reseña formateada para presentación. */
    review: ReviewViewModel;
    /** Si el usuario autenticado puede editar esta reseña (autor o ADMIN + reviews:update). */
    canEdit: boolean;
    /** Si el usuario autenticado puede eliminar esta reseña (autor o ADMIN + reviews:delete). */
    canDelete: boolean;
    /** Si el usuario autenticado puede reportar esta reseña (ajena + reports:create). */
    canReport: boolean;
    /** Callback invocado al pulsar Editar. */
    onEdit: (review: ReviewViewModel) => void;
    /** Callback invocado al pulsar Eliminar. */
    onDelete: (review: ReviewViewModel) => void;
    /** Callback invocado al pulsar Reportar. */
    onReport: (review: ReviewViewModel) => void;
};

/**
 * Tarjeta visual para mostrar una reseña de comunidad con su estado de moderación
 * y acciones contextuales (editar, eliminar, reportar).
 */
export function ReviewCard({
    review,
    canEdit,
    canDelete,
    canReport,
    onEdit,
    onDelete,
    onReport,
}: ReviewCardProps) {
    return (
        <article className="flex flex-col gap-3 rounded-md border border-gray-300 p-4">
            <header className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">
                            {review.title || 'Reseña sin título'}
                        </h3>
                        {review.isHidden && (
                            <span className="rounded-md border border-red-500 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                                Oculta por moderación
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        Por <span className="font-medium">{review.authorDisplayName}</span> (@
                        {review.authorUsername}) · {review.formattedCreatedAt}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canEdit && (
                        <Button
                            type="button"
                            variant="secondary"
                            aria-label={`Editar reseña de ${review.authorUsername}`}
                            onClick={() => onEdit(review)}
                        >
                            Editar
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            type="button"
                            variant="secondary"
                            aria-label={`Eliminar reseña de ${review.authorUsername}`}
                            onClick={() => onDelete(review)}
                        >
                            Eliminar
                        </Button>
                    )}
                    {canReport && (
                        <Button
                            type="button"
                            variant="secondary"
                            aria-label={`Reportar reseña de ${review.authorUsername}`}
                            onClick={() => onReport(review)}
                        >
                            Reportar
                        </Button>
                    )}
                </div>
            </header>

            {review.isHidden && review.hiddenReason && (
                <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
                    Motivo de ocultamiento: {review.hiddenReason}
                </p>
            )}

            <p className="whitespace-pre-line text-sm leading-relaxed">{review.content}</p>
        </article>
    );
}
