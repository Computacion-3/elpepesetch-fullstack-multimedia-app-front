'use client';

import { useRealtime } from '../hooks/use-realtime';

const labels = {
  connecting: 'Conectando en tiempo real…',
  connected: 'En línea',
  reconnecting: 'Recuperando conexión…',
  disconnected: 'Sin conexión en tiempo real',
} as const;

/** Indica al usuario el estado actual del canal de actualizaciones. */
export function RealtimeStatus() {
  const { status } = useRealtime();
  return <span className="text-xs text-gray-500" role="status">{labels[status]}</span>;
}
