"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LogoutButton({ 
  className,
  variant = "outline"
}: LogoutButtonProps) {
  const handleLogout = async () => {
    // Eliminar la cookie directamente
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    
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
