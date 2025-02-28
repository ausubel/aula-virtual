"use server";

export async function signOut() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/sign-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
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
