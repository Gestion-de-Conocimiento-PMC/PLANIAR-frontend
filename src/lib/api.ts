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

	// Normalize base (remove trailing slash except if base === '/')
	let base = API_BASE;
	if (base.length > 1 && base.endsWith('/')) base = base.slice(0, -1);

	// If both base and path contain the '/api' prefix, avoid duplicating it.
	// Examples:
	// - base === '/api' and path === '/api/users' -> result '/api/users'
	// - base === 'https://host/api' and path === '/api/users' -> 'https://host/api/users'
	if (base.endsWith('/api') && path.startsWith('/api')) {
		return base + path.replace(/^\/api/, '');
	}

	// If base is exactly '/api' (common for dev proxy) and path already starts with '/api',
	// return the path so we don't create '/api/api/...'.
	if (base === '/api' && path.startsWith('/api')) return path;

	return base + path;
};
