/** Result returned by server actions to the client: data on success, a safe message on failure. */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };
