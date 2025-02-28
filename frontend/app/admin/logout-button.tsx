"use client";

import { Button } from "@/components/ui/button";

export default function AdminLogoutButton() {
  // Función directa para cerrar sesión
  function cerrarSesion() {
    // Redirigir a la página especializada de cierre de sesión
    window.location.href = "/force-logout";
  }

  return (
    <Button 
      onClick={cerrarSesion}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
    >
      Cerrar Sesión (Admin)
    </Button>
  );
}
