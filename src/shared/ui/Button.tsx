import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: 'primary' | 'secondary';
};

const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary: 'border border-gray-400 bg-transparent text-foreground hover:bg-gray-500/10',
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
            className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
