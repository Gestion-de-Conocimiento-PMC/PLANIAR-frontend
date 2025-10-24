// src/lib/api.ts
export const API_BASE: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';
export const APIPATH = (path: string) => `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
