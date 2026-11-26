import type { ReactNode } from 'react';

type AlertProps = {
    variant: 'error' | 'success';
    children: ReactNode;
};

const styles = {
    error: 'border-red-400/50 bg-red-500/10 text-red-200',
    success: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200',
};

/** Caja de aviso para errores o confirmaciones. */
export function Alert({ variant, children }: AlertProps) {
    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
        >
            {children}
        </div>
    );
}
