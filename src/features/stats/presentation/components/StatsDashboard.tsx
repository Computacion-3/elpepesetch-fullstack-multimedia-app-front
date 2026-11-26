'use client';

import { useEffect } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { useStats } from '../hooks/use-stats';
import type { StatDistributionItemViewModel } from '../viewmodels/stats.viewmodel';

type StatsDashboardProps = {
    /** Indica si el usuario cuenta con `stats:read_global` para mostrar estadísticas globales. */
    canReadGlobal: boolean;
};

function DistributionList({
    title,
    items,
    emptyText,
}: {
    title: string;
    items: StatDistributionItemViewModel[];
    emptyText: string;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-4">
            <h3 className="text-base font-semibold">{title}</h3>
            {items.length === 0 ? (
                <p className="text-sm text-muted">{emptyText}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                        <li key={item.key} className="flex flex-col gap-1 text-sm">
                            <div className="flex justify-between">
                                <span>{item.label}</span>
                                <span className="font-medium">{item.count}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full bg-brand transition-all"
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Tablero principal de estadísticas personales y globales (`/stats`).
 * Muestra KPIs de biblioteca, distribución por tipo/estado, top géneros,
 * historial mensual de completados y, para administradores, resumen global de la plataforma.
 */
export function StatsDashboard({ canReadGlobal }: StatsDashboardProps) {
    const {
        personal,
        global,
        isLoadingPersonal,
        isLoadingGlobal,
        personalError,
        globalError,
        loadPersonal,
        loadGlobal,
    } = useStats();

    useEffect(() => {
        void loadPersonal();
    }, [loadPersonal]);

    useEffect(() => {
        if (canReadGlobal) {
            void loadGlobal();
        }
    }, [canReadGlobal, loadGlobal]);

    const handleRefresh = () => {
        void loadPersonal();
        if (canReadGlobal) {
            void loadGlobal();
        }
    };

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Estadísticas</h1>
                    <p className="text-sm text-muted">
                        Resumen de tu colección multimedia y métricas de la plataforma.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    loading={isLoadingPersonal || isLoadingGlobal}
                    onClick={handleRefresh}
                >
                    Actualizar
                </Button>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Mis estadísticas</h2>
                {personalError && <Alert variant="error">{personalError}</Alert>}
                {isLoadingPersonal && !personal ? (
                    <p className="text-sm">Cargando estadísticas personales…</p>
                ) : (
                    personal && (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                    <p className="text-xs text-muted">Total en biblioteca</p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {personal.totalEntries}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                    <p className="text-xs text-muted">Calificación promedio</p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {personal.averageRatingLabel}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                    <p className="text-xs text-muted">
                                        Completados (últimos 12 meses)
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {personal.recentCompletionsTotal}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <DistributionList
                                    title="Por tipo de medio"
                                    items={personal.byType}
                                    emptyText="Sin elementos registrados."
                                />
                                <DistributionList
                                    title="Por estado"
                                    items={personal.byStatus}
                                    emptyText="Sin elementos registrados."
                                />
                                <DistributionList
                                    title="Top 5 géneros"
                                    items={personal.topGenres}
                                    emptyText="Aún no tienes géneros registrados en tu biblioteca."
                                />
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                <h3 className="mb-3 text-base font-semibold">
                                    Finalizaciones mensuales (últimos 12 meses)
                                </h3>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                                    {personal.completedByMonth.map((month) => (
                                        <div
                                            key={month.month}
                                            className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-2 text-center text-xs"
                                        >
                                            <span className="text-muted">{month.label}</span>
                                            <span className="text-base font-semibold">
                                                {month.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>

            {canReadGlobal && (
                <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                    <h2 className="text-lg font-semibold">Estadísticas globales</h2>
                    {globalError && <Alert variant="error">{globalError}</Alert>}
                    {isLoadingGlobal && !global ? (
                        <p className="text-sm">Cargando estadísticas globales…</p>
                    ) : (
                        global && (
                            <>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                    <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                        <p className="text-xs text-muted">Usuarios</p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            {global.users}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                        <p className="text-xs text-muted">Catálogo total</p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            {global.totalMediaItems}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                        <p className="text-xs text-muted">
                                            Entradas en bibliotecas
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            {global.libraryEntries}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-surface p-4">
                                        <p className="text-xs text-muted">Reseñas</p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            {global.reviews}
                                        </p>
                                    </div>
                                </div>

                                <DistributionList
                                    title="Catálogo global por tipo"
                                    items={global.mediaItemsByType}
                                    emptyText="Sin elementos en catálogo."
                                />
                            </>
                        )
                    )}
                </div>
            )}
        </section>
    );
}
