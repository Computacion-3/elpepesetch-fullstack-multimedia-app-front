import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    error?: string;
};

/** Selector con etiqueta y mensaje de error accesible. */
export function Select({ id, label, options, error, className = '', ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>
            <select
                id={id}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`min-h-11 w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${error ? 'border-red-400' : 'border-white/20'} ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p id={`${id}-error`} className="text-sm text-red-300">
                    {error}
                </p>
            )}
        </div>
    );
}
