import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available in storage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('sb_token');
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract error messages & handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      // If unauthorized, notify application to reset auth if on protected view
      window.dispatchEvent(new CustomEvent('sb_unauthorized'));
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from an API error response.
 */
export function getApiErrorMessage(error: unknown, defaultMessage = 'An unexpected error occurred. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data?.errors && typeof data.errors === 'object') {
      const firstError = Object.values(data.errors).flat()[0];
      if (typeof firstError === 'string') return firstError;
      if (firstError) return String(firstError);
    }
    if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection or try again later.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}
