"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "../logout-button"
import { GraduationCap, Users, BookOpen, Medal, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNavBar() {
  const pathname = usePathname()

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    if (path === '/admin') {
      // Para la ruta principal, solo debe estar activa si es exactamente igual
      return pathname === path;
    }
    // Para las demás rutas, usar startsWith
    return pathname.startsWith(path);
  }

  // Estilo común para todos los botones de navegación
  const navButtonStyle = "px-3 h-10 font-medium transition-all duration-200 ease-in-out";
  
  // Estilo para botones inactivos
  const inactiveStyle = "text-[var(--admin-accent)] hover:text-white";
  
  // Estilo para botones activos
  const activeStyle = "bg-[var(--admin-secondary)] text-white before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-2/3 before:h-[3px] before:bg-[var(--admin-primary)] before:rounded-t-md relative";

  return (
    <nav className="bg-[var(--admin-dark)] border-b-[3px] border-[var(--admin-primary)] shadow-lg">
      <div className="flex h-16 items-center px-6">
        <Link href="/admin" className="mr-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--admin-primary)] to-[#f04e5c] flex items-center justify-center mr-2 shadow-md">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="hidden md:inline text-[var(--admin-background)] font-semibold">
              Aula Virtual
            </span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-1 md:space-x-2 ml-2">
          <Link href="/admin">
            <Button 
              variant="ghost" 
              className={cn(
                navButtonStyle,
                inactiveStyle,
                isActive("/admin") && activeStyle
              )}
            >
              <Home className="h-4 w-4 mr-2 icon-white" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/students">
            <Button 
              variant="ghost" 
              className={cn(
                navButtonStyle,
                inactiveStyle,
                isActive("/admin/students") && activeStyle
              )}
            >
              <Users className="h-4 w-4 mr-2 icon-white" />
              <span>Estudiantes</span>
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button 
              variant="ghost" 
              className={cn(
                navButtonStyle,
                inactiveStyle,
                isActive("/admin/courses") && activeStyle
              )}
            >
              <BookOpen className="h-4 w-4 mr-2 icon-white" />
              <span>Cursos</span>
            </Button>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <LogoutButton 
            className="bg-gradient-to-r from-[var(--admin-primary)] to-[#f04e5c] text-white hover:shadow-md transition-all hover:scale-105" 
            variant="default" 
          />
        </div>
      </div>
    </nav>
  )
}