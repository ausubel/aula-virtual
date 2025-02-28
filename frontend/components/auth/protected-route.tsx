"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: number[]; // IDs de roles permitidos
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Si se especifican roles requeridos, verificar si el usuario tiene uno de ellos
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = getUserRole();
      if (!userRole || !requiredRoles.includes(userRole)) {
        // Redirigir a una página de acceso denegado o a la página principal
        router.push("/");
        return;
      }
    }

    setIsLoading(false);
  }, [router, requiredRoles]);

  if (isLoading) {
    // Mostrar un indicador de carga mientras se verifica la autenticación
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
