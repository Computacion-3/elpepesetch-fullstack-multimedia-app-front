'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import {
    ArrowRight,
    BookOpen,
    ChartNoAxesCombined,
    CircleCheck,
    Clapperboard,
    Clock3,
    LibraryBig,
    MessageSquareText,
    type LucideIcon,
} from 'lucide-react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { useStats } from '../hooks/use-stats';
import { Spinner } from '@/src/shared/ui/Spinner';

function MetricCard({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string | number;
}) {
    return (
        <article className="flex items-start gap-4 rounded-2xl border border-white/10 bg-surface p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
            </div>
        </article>
    );
}

const quickLinks = [
    {
        href: '/catalog',
        label: 'Explorar catálogo',
        description: 'Encuentra tu próxima historia.',
        icon: Clapperboard,
    },
    {
        href: '/library',
        label: 'Mi biblioteca',
        description: 'Organiza lo que disfrutas.',
        icon: LibraryBig,
    },
    {
        href: '/reviews',
        label: 'Reseñas',
        description: 'Comparte opiniones con la comunidad.',
        icon: MessageSquareText,
    },
];

export function HomeDashboard({ displayName }: { displayName: string }) {
    const { personal, isLoadingPersonal, personalError, loadPersonal } = useStats();

    useEffect(() => {
        void loadPersonal();
    }, [loadPersonal]);

    const countForStatus = (key: string) =>
        personal?.byStatus.find((status) => status.key === key)?.count ?? 0;

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-surface-raised via-surface to-background p-6 shadow-xl shadow-black/10 sm:p-9">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-brand/10 blur-3xl"
                />
                <div className="relative max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                        Tu espacio multimedia
                    </p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                        Hola, {displayName}
                    </h1>
                    <p className="mt-3 text-muted">
                        Continúa organizando lo que disfrutas o descubre algo nuevo para agregar a
                        tu colección.
                    </p>
                    <Link
                        href="/catalog"
                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-background transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        Explorar catálogo
                        <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                </div>
            </header>

            <section aria-labelledby="home-library-title" className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 id="home-library-title" className="text-xl font-semibold">
                            Tu biblioteca de un vistazo
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                            El progreso de tus juegos, películas y libros.
                        </p>
                    </div>
                    <Link
                        href="/stats"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        Ver estadísticas
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                {personalError && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Alert variant="error">{personalError}</Alert>
                        <Button
                            type="button"
                            variant="secondary"
                            loading={isLoadingPersonal}
                            onClick={() => void loadPersonal()}
                        >
                            Reintentar
                        </Button>
                    </div>
                )}

                {isLoadingPersonal && !personal ? (
                    <Spinner label="Cargando el resumen de tu biblioteca" size="lg" className="py-12" />
                ) : personal ? (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                icon={BookOpen}
                                label="Elementos en tu biblioteca"
                                value={personal.totalEntries}
                            />
                            <MetricCard
                                icon={Clock3}
                                label="En progreso"
                                value={countForStatus('IN_PROGRESS')}
                            />
                            <MetricCard
                                icon={CircleCheck}
                                label="Completados"
                                value={countForStatus('COMPLETED')}
                            />
                            <MetricCard
                                icon={ChartNoAxesCombined}
                                label="Calificación promedio"
                                value={personal.averageRatingLabel}
                            />
                        </div>
                        {personal.totalEntries === 0 && (
                            <p className="rounded-2xl border border-dashed border-white/15 bg-surface/60 p-4 text-sm text-muted">
                                Tu biblioteca está lista para empezar. Explora el catálogo y guarda
                                tus primeros elementos.
                            </p>
                        )}
                    </>
                ) : !personalError ? (
                    <p className="rounded-2xl border border-white/10 bg-surface p-5 text-sm text-muted">
                        Aún no hay un resumen disponible.
                    </p>
                ) : null}
            </section>

            <section aria-labelledby="home-quick-links-title" className="flex flex-col gap-4">
                <div>
                    <h2 id="home-quick-links-title" className="text-xl font-semibold">
                        ¿Qué te gustaría hacer?
                    </h2>
                    <p className="mt-1 text-sm text-muted">Atajos a tus secciones principales.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {quickLinks.map(({ href, label, description, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex min-h-28 items-center gap-4 rounded-2xl border border-white/10 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/5 text-brand transition group-hover:bg-brand/10">
                                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                                <span className="block font-semibold">{label}</span>
                                <span className="mt-1 block text-sm text-muted">{description}</span>
                            </span>
                            <ArrowRight
                                size={17}
                                className="ml-auto shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-brand"
                                aria-hidden="true"
                            />
                        </Link>
                    ))}
                </div>
            </section>
        </section>
    );
}
