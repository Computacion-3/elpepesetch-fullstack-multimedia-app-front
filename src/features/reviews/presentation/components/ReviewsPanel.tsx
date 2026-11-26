'use client';

import { useEffect, useState } from 'react';
import { ReportReviewForm } from '@/src/features/reports/presentation/components/ReportReviewForm';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { Modal } from '@/src/shared/ui/Modal';
import { Pagination } from '@/src/shared/ui/Pagination';
import { Select } from '@/src/shared/ui/Select';
import { useReviews } from '../hooks/use-reviews';
import type { ReviewViewModel } from '../viewmodels/reviews.viewmodel';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

type ReviewsPanelProps = {
    /** ID del usuario autenticado para determinar autoría y evitar auto-reportes. */
    currentUserId: number;
    /** Rol del usuario autenticado (ej. `ADMIN` puede editar o eliminar cualquier reseña). */
    currentUserRole: string;
    /** Permisos verificados en servidor para adaptar la UI de manera coherente. */
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canReport: boolean;
    /** Identificador opcional recibido por URL (`?mediaItemId=`) para abrir un título específico. */
    initialMediaItemId?: string;
};

/**
 * Pantalla principal del módulo de reseñas de la comunidad (`/reviews`).
 * Permite elegir un elemento del catálogo, listar reseñas paginadas, crear/editar/eliminar
 * reseñas y reportar reseñas ajenas.
 */
export function ReviewsPanel({
    currentUserId,
    currentUserRole,
    canCreate,
    canUpdate,
    canDelete,
    canReport,
    initialMediaItemId,
}: ReviewsPanelProps) {
    const {
        mediaOptions,
        isLoadingOptions,
        selectedMediaId,
        reviews,
        page,
        isLoading,
        isMutating,
        errorMessage,
        successMessage,
        loadMediaOptions,
        loadReviews,
        selectMedia,
        changePage,
        remove,
        clearFeedback,
    } = useReviews();

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ReviewViewModel | null>(null);
    const [toDelete, setToDelete] = useState<ReviewViewModel | null>(null);
    const [toReport, setToReport] = useState<ReviewViewModel | null>(null);
    const [reportSentMessage, setReportSentMessage] = useState<string | null>(null);

    useEffect(() => {
        if (initialMediaItemId) {
            selectMedia(initialMediaItemId);
        }
    }, [initialMediaItemId, selectMedia]);

    useEffect(() => {
        void loadMediaOptions();
    }, [loadMediaOptions]);

    useEffect(() => {
        if (selectedMediaId) {
            void loadReviews(selectedMediaId, page.page);
        }
    }, [loadReviews, page.page, selectedMediaId]);

    const openCreate = () => {
        clearFeedback();
        setReportSentMessage(null);
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (review: ReviewViewModel) => {
        clearFeedback();
        setReportSentMessage(null);
        setEditing(review);
        setFormOpen(true);
    };

    const cancelForm = () => {
        setFormOpen(false);
        setEditing(null);
        clearFeedback();
    };

    /** Cierra el modal conservando `successMessage` cuando la reseña se guardó correctamente. */
    const completeForm = () => {
        setFormOpen(false);
        setEditing(null);
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        await remove(toDelete.id);
        setToDelete(null);
    };

    const handleReportDone = () => {
        setToReport(null);
        setReportSentMessage('Reporte enviado correctamente para moderación.');
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Reseñas de la comunidad</h1>
                    <p className="text-sm text-muted">
                        Consulta opiniones por título, publica tu reseña o reporta contenido
                        inapropiado.
                    </p>
                </div>
                {canCreate && selectedMediaId && (
                    <Button type="button" onClick={openCreate}>
                        Nueva reseña
                    </Button>
                )}
            </div>

            <div className="max-w-md">
                <Select
                    id="reviews-media-select"
                    label="Elemento multimedia"
                    value={selectedMediaId}
                    disabled={isLoadingOptions || mediaOptions.length === 0}
                    options={
                        mediaOptions.length === 0
                            ? [{ value: '', label: 'Cargando elementos del catálogo…' }]
                            : mediaOptions.map((option) => ({
                                  value: option.id,
                                  label: option.label,
                              }))
                    }
                    onChange={(e) => {
                        setReportSentMessage(null);
                        clearFeedback();
                        selectMedia(e.target.value);
                    }}
                />
            </div>

            {errorMessage && !formOpen && <Alert variant="error">{errorMessage}</Alert>}
            {successMessage && !formOpen && <Alert variant="success">{successMessage}</Alert>}
            {reportSentMessage && <Alert variant="success">{reportSentMessage}</Alert>}

            {isLoading && reviews.length === 0 ? (
                <p className="text-sm">Cargando reseñas…</p>
            ) : reviews.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-surface p-4 text-sm text-muted">
                    Aún no hay reseñas visibles para este elemento multimedia.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {reviews.map((review) => {
                        const isOwnerOrAdmin =
                            review.authorId === currentUserId || currentUserRole === 'ADMIN';
                        return (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                canEdit={canUpdate && isOwnerOrAdmin}
                                canDelete={canDelete && isOwnerOrAdmin}
                                canReport={canReport && review.authorId !== currentUserId}
                                onEdit={openEdit}
                                onDelete={setToDelete}
                                onReport={(selected) => {
                                    setReportSentMessage(null);
                                    setToReport(selected);
                                }}
                            />
                        );
                    })}
                </div>
            )}

            <Pagination
                page={page.page}
                totalPages={page.totalPages}
                onChange={(next) => changePage(next)}
            />

            <Modal
                open={formOpen}
                title={editing ? 'Editar reseña' : 'Nueva reseña'}
                onClose={cancelForm}
            >
                <ReviewForm
                    mediaItemId={selectedMediaId}
                    review={editing ?? undefined}
                    onDone={completeForm}
                />
            </Modal>

            <ConfirmDialog
                open={toDelete !== null}
                title="Eliminar reseña"
                message="¿Seguro que deseas eliminar esta reseña? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                loading={isMutating}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />

            <Modal
                open={toReport !== null}
                title="Reportar reseña"
                onClose={() => setToReport(null)}
            >
                {toReport && (
                    <ReportReviewForm
                        reviewId={toReport.id}
                        reviewPreview={toReport.title || toReport.content.slice(0, 80)}
                        onDone={handleReportDone}
                    />
                )}
            </Modal>
        </section>
    );
}
