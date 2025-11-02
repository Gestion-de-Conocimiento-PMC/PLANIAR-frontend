// src/lib/api.ts
export const API_BASE: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';

/**
 * Build a normalized API path.
 * Handles these cases safely:
 * - API_BASE may be a relative '/api' (for Vite proxy) or an absolute URL.
 * - Avoid producing '/api/api/...' when callers already pass paths that include '/api'.
 */
export const APIPATH = (p: string) => {
	const path = p.startsWith('/') ? p : '/' + p;

	// Use the env-provided base only when it's an absolute URL (http:// or https://)
	const baseRaw = API_BASE || '';
	const isAbsolute = /^https?:\/\//i.test(baseRaw);





	const fallback = 'http://localhost:8080';
	const base = isAbsolute ? baseRaw.replace(/\/$/, '') : fallback.replace(/\/$/, '');

	// If neither base nor path include the '/api' prefix, insert it.
	const needsApiPrefix = !base.endsWith('/api') && !path.startsWith('/api');
	const apiPrefix = needsApiPrefix ? '/api' : '';

	return base + apiPrefix + path;
};
