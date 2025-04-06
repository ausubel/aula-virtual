"use server";

import apiClient from "@/lib/api-client";

export async function signOut() {
  try {
    const response = await apiClient.post('/auth/sign-out');

    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Error al cerrar sesión',
      };
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor',
    };
  }
}
