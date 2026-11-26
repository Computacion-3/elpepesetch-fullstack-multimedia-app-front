'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Modal } from '@/src/shared/ui/Modal';
import { Pagination } from '@/src/shared/ui/Pagination';
import { Select } from '@/src/shared/ui/Select';
import { TextArea } from '@/src/shared/ui/TextArea';
import type { ReportStatus } from '../../domain/entities/report';
import { useReports } from '../hooks/use-reports';
import type { ReviewReportViewModel } from '../viewmodels/reports.viewmodel';

const STATUS_FILTER_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: 'OPEN', label: 'Abiertos' },
    { value: 'RESOLVED', label: 'Resueltos (Oculta)' },
    { value: 'DISMISSED', label: 'Descartados' },
];

/**
 * Panel de moderación de reportes de reseñas (solo moderadores y administradores).
 * Permite filtrar por estado, paginar, ocultar reseñas con motivo obligatorio o descartar reportes.
 */
export function ReportsModerationPanel() {
    const {
        reports,
        page,
        filters,
        isLoading,
        isMutating,
        errorMessage,
        successMessage,
        load,
        setFilters,
        resolveReport,
        clearFeedback,
    } = useReports();

    const [hideTarget, setHideTarget] = useState<ReviewReportViewModel | null>(null);
    const [hideReason, setHideReason] = useState('');

    useEffect(() => {
        void load();
    }, [load]);

    const openHideModal = (report: ReviewReportViewModel) => {
        clearFeedback();
        setHideReason('');
        setHideTarget(report);
    };

    const closeHideModal = () => {
        setHideTarget(null);
        setHideReason('');
        clearFeedback();
    };

    const handleHideSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!hideTarget) return;
        const ok = await resolveReport(hideTarget.id, {
            action: 'HIDE',
            reason: hideReason,
        });
        if (ok) {
            setHideTarget(null);
            setHideReason('');
        }
    };

    const handleDismiss = async (report: ReviewReportViewModel) => {
        clearFeedback();
        await resolveReport(report.id, { action: 'DISMISS' });
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Moderación de reportes</h1>
                    <p className="text-sm text-gray-500">
                        Revisa los reportes de la comunidad para ocultar reseñas infractoras o
                        descartar avisos improcedentes.
                    </p>
                </div>
                <div className="w-56">
                    <Select
                        id="reports-status-filter"
                        label="Estado"
                        value={filters.status ?? ''}
                        options={STATUS_FILTER_OPTIONS}
                        onChange={(e) => {
                            const value = e.target.value as ReportStatus | '';
                            setFilters({ status: value || undefined });
                        }}
                    />
                </div>
            </div>

            {errorMessage && !hideTarget && <Alert variant="error">{errorMessage}</Alert>}
            {successMessage && !hideTarget && <Alert variant="success">{successMessage}</Alert>}

            {isLoading && reports.length === 0 ? (
                <p className="text-sm">Cargando reportes…</p>
            ) : reports.length === 0 ? (
                <p className="rounded-md border border-gray-300 p-4 text-sm text-gray-500">
                    No hay reportes para el filtro seleccionado.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {reports.map((report) => (
                        <article
                            key={report.id}
                            className="flex flex-col gap-3 rounded-md border border-gray-300 p-4"
                        >
                            <header className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold">
                                            {report.mediaTitle}
                                        </span>
                                        <span className="rounded-md border border-gray-400 px-2 py-0.5 text-xs font-medium">
                                            {report.reasonLabel}
                                        </span>
                                        <span
                                            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                                                report.isOpen
                                                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                                                    : report.status === 'RESOLVED'
                                                      ? 'border-red-500 bg-red-50 text-red-800'
                                                      : 'border-green-600 bg-green-50 text-green-800'
                                            }`}
                                        >
                                            {report.statusLabel}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Reportado por @{report.reporterUsername} el{' '}
                                        {report.formattedCreatedAt}
                                    </p>
                                </div>

                                {report.isOpen && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            aria-label={`Ocultar reseña del reporte ${report.id}`}
                                            disabled={isMutating}
                                            onClick={() => openHideModal(report)}
                                        >
                                            Ocultar reseña
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            aria-label={`Descartar reporte ${report.id}`}
                                            disabled={isMutating}
                                            onClick={() => void handleDismiss(report)}
                                        >
                                            Descartar
                                        </Button>
                                    </div>
                                )}
                            </header>

                            <div className="rounded-md border border-gray-200 bg-gray-50/50 p-3 text-sm">
                                <p className="text-xs font-medium text-gray-500">
                                    Reseña de @{report.reviewAuthorUsername} — {report.reviewTitle}
                                </p>
                                <p className="mt-1 whitespace-pre-line">{report.reviewContent}</p>
                            </div>

                            {report.comment && (
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Comentario del reporte:</span>{' '}
                                    {report.comment}
                                </p>
                            )}

                            {!report.isOpen && (
                                <p className="text-xs text-gray-500">
                                    Resuelto por @{report.resolvedByUsername ?? 'moderador'}
                                    {report.formattedResolvedAt
                                        ? ` el ${report.formattedResolvedAt}`
                                        : ''}
                                    {report.reviewHiddenReason
                                        ? ` · Motivo: ${report.reviewHiddenReason}`
                                        : ''}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <Pagination
                page={page.page}
                totalPages={page.totalPages}
                onChange={(next) => setFilters({ page: next })}
            />

            <Modal
                open={hideTarget !== null}
                title="Ocultar reseña reportada"
                onClose={closeHideModal}
            >
                <form onSubmit={handleHideSubmit} className="flex flex-col gap-4">
                    {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
                    {hideTarget && (
                        <p className="text-xs text-gray-600">
                            Reseña de @{hideTarget.reviewAuthorUsername}:{' '}
                            <span className="font-medium">{hideTarget.reviewTitle}</span>
                        </p>
                    )}
                    <TextArea
                        id="hide-review-reason"
                        label="Motivo de moderación (obligatorio)"
                        rows={3}
                        maxLength={255}
                        placeholder="Ej. Contiene spoilers sin advertencia"
                        value={hideReason}
                        onChange={(e) => setHideReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={closeHideModal}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={isMutating}>
                            Confirmar ocultamiento
                        </Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
