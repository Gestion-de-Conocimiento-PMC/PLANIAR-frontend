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

	// If base is an absolute URL but doesn't include the '/api' prefix, and the
	// requested path doesn't include it either, insert '/api' between them.
	// This makes the function tolerant to a Vercel env that sets VITE_API_URL
	// to 'https://host' instead of 'https://host/api'.
	const isAbsolute = /^https?:\/\//i.test(base);
	if (isAbsolute && !base.endsWith('/api') && !path.startsWith('/api')) {
		return base + '/api' + path;
	}

	// If base is absolute and path already starts with /api, just concatenate.
	if (isAbsolute && path.startsWith('/api')) return base + path;

	return base + path;
};
