/**
 * Credencial corta (60 s) y de un solo uso para el handshake del WebSocket.
 * NO es el token de sesión: ese se queda en la cookie httpOnly y nunca llega al navegador.
 * Objeto plano a propósito: cruza la frontera de la Server Action.
 */
export interface SocketTicket {
    token: string;
    expiresInSeconds: number;
}
