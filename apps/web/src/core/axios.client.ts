import axios, { AxiosError } from 'axios';

function toUserFacingRequestError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
        const ax = error as AxiosError;
        if (ax.code === 'ECONNABORTED') {
            return new Error('REQUEST_TIMEOUT');
        }
        if (ax.code === 'ERR_NETWORK' || !ax.response) {
            return new Error('NETWORK_ERROR');
        }
        const status = ax.response.status;
        if (status >= 500) {
            return new Error('SERVER_ERROR');
        }
        return new Error('REQUEST_FAILED');
    }
    return error instanceof Error ? error : new Error('UNKNOWN_ERROR');
}

// Usamos la variable de entorno como fallback, pero priorizamos la localStorage 
// por si el usuario ya ingresó una IP dinámica según los requerimientos.
const getBaseUrl = () => {
    const localUrl = localStorage.getItem('backendUrl');
    if (localUrl) return localUrl;

    return import.meta.env.VITE_API_BACKEND || 'http://localhost:8080';
};

export const apiClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para refrescar la URL base si cambia dinámicamente en tiempo de ejecución
apiClient.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toUserFacingRequestError(error))
);
