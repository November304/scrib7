export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message)
    }
}

// Petit wrapper autour de fetch : JSON en entrée/sortie, erreurs HTTP -> exceptions
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}) {
    const res = await fetch(`/api${path}`, {
        method: options.method ?? 'GET',
        headers: options.body ? { 'Content-Type': 'application/json' } : {},
        body: options.body ? JSON.stringify(options.body) : undefined,
    })
    const data = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, data?.error ?? `Erreur ${res.status}`)
    return data as T
}
