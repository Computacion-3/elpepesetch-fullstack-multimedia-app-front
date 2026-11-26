import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: 'primary' | 'secondary';
};

const variants = {
    primary: 'bg-brand text-[#17132b] hover:bg-brand-hover',
    secondary: 'border border-white/20 bg-white/5 text-foreground hover:bg-white/10',
};

/** Botón con variantes y estado de carga. */
export function Button({
    loading = false,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading}
            className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
