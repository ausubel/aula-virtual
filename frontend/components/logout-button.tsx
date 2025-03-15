"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import Cookies from 'js-cookie'

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LogoutButton({ 
  className,
  variant = "outline"
}: LogoutButtonProps) {
  const handleLogout = async () => {
    // Lista de todas las cookies relevantes para eliminar
    const cookies = ['token', 'user_id', 'user_role', 'user_name', 'has_uploaded_cv', 'auth_token'];
    
    // Eliminar cookies usando document.cookie (método alternativo)
    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
    });
    
    // Eliminar cookies usando js-cookie
    cookies.forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
    
    // Redirigir a la página de login
    window.location.href = "/login";
  }

  return (
    <Button 
      onClick={handleLogout}
      variant={variant}
      className={cn("gap-1", className)}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Cerrar Sesión</span>
    </Button>
  )
}
