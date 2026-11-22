'use client';

import { Button } from './Button';

type PaginationProps = {
    page: number;
    totalPages: number;
    onChange: (nextPage: number) => void;
};

/** Controles de paginación Anterior/Siguiente. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Paginación" className="flex items-center justify-end gap-3">
            <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                Anterior
            </Button>
            <span className="text-sm">
                Página {page} de {totalPages}
            </span>
            <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
            >
                Siguiente
            </Button>
        </nav>
    );
}
