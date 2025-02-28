"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Eliminar el token directamente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      
      // Redireccionar inmediatamente
      window.location.href = "/login";
    }
  }, []);

  // Este contenido casi nunca se mostrará debido a la redirección inmediata
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Cerrando sesión...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
