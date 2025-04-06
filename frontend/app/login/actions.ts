"use server";

import apiClient from "@/lib/api-client";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await apiClient.post('/auth/sign-in', {
      username: email,
      password: password,
    });

    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Error al iniciar sesión',
      };
    }
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor',
    };
  }
}