"use client";

import { useEffect, useState } from "react";

export default function CookieLogout() {
  const [status, setStatus] = useState("Iniciando cierre de sesión...");

  useEffect(() => {
    // Función para realizar el cierre de sesión completo
    const fullLogout = async () => {
      try {
        // Paso 1: Eliminar la cookie de autenticación
        document.cookie = "auth_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        setStatus("Cookies eliminadas...");
        
        // Paso 2: Eliminar el token del localStorage
        localStorage.clear(); // Eliminar todo el localStorage
        setStatus("LocalStorage limpiado...");
        
        // Paso 3: Pequeña pausa para asegurar que todo se ha limpiado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Paso 4: Redireccionar a la página de login
        setStatus("Redirigiendo a la página de login...");
        window.location.replace("/login");
      } catch (error) {
        console.error("Error durante el cierre de sesión:", error);
        setStatus(`Error: ${error.message}`);
      }
    };

    // Ejecutar el cierre de sesión automáticamente
    fullLogout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Cerrando sesión</h1>
        
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
        
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
