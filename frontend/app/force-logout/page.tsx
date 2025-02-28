"use client";

import { useEffect } from "react";

export default function ForceLogout() {
  useEffect(() => {
    // Función para limpiar el token y redirigir
    const logout = () => {
      try {
        // Eliminar todas las claves de localStorage
        localStorage.clear();
        
        // Esperar un momento antes de redirigir
        setTimeout(() => {
          // Usar replace para evitar que se pueda volver atrás
          window.location.replace("/login");
        }, 100);
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión. Intenta de nuevo.");
      }
    };

    // Ejecutar la función de logout inmediatamente
    logout();

    // También configurar un temporizador de respaldo
    const backupTimer = setTimeout(() => {
      window.location.href = "/login";
    }, 2000);

    return () => clearTimeout(backupTimer);
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      backgroundColor: "#f9fafb" 
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Cerrando sesión...
      </h1>
      <div style={{ 
        width: "48px", 
        height: "48px", 
        border: "4px solid rgba(0, 0, 0, 0.1)", 
        borderLeftColor: "#e11d48", 
        borderRadius: "50%", 
        animation: "spin 1s linear infinite" 
      }}></div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
