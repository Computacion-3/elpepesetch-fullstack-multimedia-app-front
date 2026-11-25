/** Lee el modo de biblioteca; REST queda como opción segura por defecto. */
export function getLibraryDataSourceMode(value?: string): 'rest' | 'graphql' {
  const mode = value ?? 'rest';
  if (mode === 'rest' || mode === 'graphql') return mode;
  throw new Error(`NEXT_PUBLIC_DATA_SOURCE debe ser "rest" o "graphql"; se recibió "${mode}".`);
}
