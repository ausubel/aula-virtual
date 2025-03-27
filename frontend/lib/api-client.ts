import axios from 'axios';

// Determinar si estamos en el cliente o en el servidor
const isClient = typeof window !== 'undefined';

// Obtener la URL base del backend
const getBaseUrl = () => {
  // En el cliente (navegador), usamos rutas relativas
  if (isClient) {
    return '';
  }
  // En el servidor, usamos la URL completa del backend
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:3002';
};

console.log('API Client - isClient:', isClient);
console.log('API Client - baseURL:', getBaseUrl());

// Crear una instancia de axios con la configuración base
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación si está disponible
apiClient.interceptors.request.use((config) => {
  console.log('API Client - Request URL:', `${config.baseURL || ''}${config.url}`);
  
  if (isClient) {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para logs de respuesta
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Client - Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`API Client - Error from ${error.config?.url}:`, error.response?.status || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
