/**
 * Utility for making server-side API calls
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function serverApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Asegurar que siempre tengamos los headers correctos
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición al servidor');
    }

    return data;
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
}
