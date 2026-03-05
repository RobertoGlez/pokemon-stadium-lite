import axios from 'axios';

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
