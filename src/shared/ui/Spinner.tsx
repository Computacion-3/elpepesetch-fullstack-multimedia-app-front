type SpinnerProps = {
    /** Texto para lectores de pantalla; no se muestra. */
    label: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-7 w-7 border-[3px]',
    lg: 'h-10 w-10 border-[3px]',
};

/**
 * Indicador de carga: un círculo que gira. El texto queda solo para lectores de pantalla
 * (`role="status"`), así la interfaz no se llena de mensajes de "Cargando…".
 */
export function Spinner({ label, size = 'md', className = '' }: SpinnerProps) {
    return (
        <div role="status" className={`flex items-center justify-center ${className}`}>
            <span
                aria-hidden="true"
                className={`animate-spin rounded-full border-white/15 border-t-brand motion-reduce:animate-[spin_1.6s_linear_infinite] ${sizes[size]}`}
            />
            <span className="sr-only">{label}</span>
        </div>
    );
}
