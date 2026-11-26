'use client';

import { useRealtime } from '../hooks/use-realtime';

const labels = {
  connecting: 'Conectando en tiempo real…',
  connected: 'En línea',
  reconnecting: 'Recuperando conexión…',
  disconnected: 'Sin conexión en tiempo real',
} as const;

const dots = {
  connecting: 'bg-amber-300 motion-safe:animate-pulse',
  connected: 'bg-emerald-400',
  reconnecting: 'bg-amber-300 motion-safe:animate-pulse',
  disconnected: 'bg-gray-500',
} as const;

/**
 * Punto de color con el estado del canal en tiempo real. El texto queda para lectores de pantalla
 * (y como tooltip), así no ocupa espacio en la barra.
 */
export function RealtimeStatus({ className = '' }: { className?: string }) {
  const { status } = useRealtime();
  return (
    <span role="status" title={labels[status]} className={`inline-flex ${className}`}>
      <span aria-hidden="true" className={`block h-3 w-3 rounded-full ring-2 ring-surface ${dots[status]}`} />
      <span className="sr-only">{labels[status]}</span>
    </span>
  );
}
