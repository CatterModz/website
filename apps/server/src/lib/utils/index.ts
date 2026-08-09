export function apiError(c: any, message: string, code: number, status: 400 | 401 | 404 = 400) {
    return c.json({ message, code }, status);
}