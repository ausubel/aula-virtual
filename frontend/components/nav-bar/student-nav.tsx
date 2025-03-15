"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "@/components/ui/notifications"
import { 
  BookOpenIcon, 
  LogOutIcon, 
  UserIcon, 
  SettingsIcon, 
  AwardIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"
import Cookies from 'js-cookie'

const studentNavLinks = [
  {
    href: "/student/courses",
    label: "Mis Cursos",
    icon: <BookOpenIcon className="size-4 mr-2 icon-white" />,
  },
  {
    href: "/student/certificates",
    label: "Certificados",
    icon: <AwardIcon className="size-4 mr-2 icon-white" />,
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: <UserIcon className="size-4 mr-2 icon-white" />,
  },
  {
    href: "/settings",
    label: "Configuración",
    icon: <SettingsIcon className="size-4 mr-2 icon-white" />,
  },
]

export function StudentNavBar() {
  const pathname = usePathname()

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    if (path === '/student') {
      // Para la ruta principal, solo debe estar activa si es exactamente igual
      return pathname === path;
    }
    // Para las demás rutas, usar startsWith
    return pathname.startsWith(path);
  }

  // Estilo común para todos los botones de navegación
  const navButtonStyle = "px-3 h-10 font-medium transition-all duration-200 ease-in-out";
  
  // Estilo para botones inactivos
  const inactiveStyle = "text-[var(--student-accent)] hover:text-white";
  
  // Estilo para botones activos
  const activeStyle = "bg-[var(--student-secondary)] text-white before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-2/3 before:h-[3px] before:bg-[var(--student-primary)] before:rounded-t-md relative";

  const handleLogout = () => {
    // Eliminar todas las cookies relevantes
    const cookies = ['token', 'user_id', 'user_role', 'user_name', 'has_uploaded_cv'];
    
    // Eliminar cookies usando document.cookie (método alternativo)
    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
    });
    
    // Eliminar cookies usando js-cookie
    cookies.forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
    
    // Redireccionar a la página de cierre de sesión
    window.location.href = '/cookie-logout';
  }

  return (
    <nav className="bg-[var(--student-dark)] border-b-[3px] border-[var(--student-primary)] shadow-lg sticky top-0 z-50">
      <div className="flex h-16 items-center px-6">
        {/* Logo y navegación principal */}
        <Link href="/student" className="mr-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--student-primary)] to-[#f04e5c] flex items-center justify-center mr-2 shadow-md">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="hidden md:inline text-[var(--student-background)] font-semibold">
              Aula Virtual
            </span>
          </div>
        </Link>
        
        {/* Menú móvil */}
        <div className="md:hidden">
          <MobileNav links={studentNavLinks} />
        </div>
        
        {/* Enlaces de navegación para escritorio */}
        <div className="hidden md:flex items-center space-x-1 ml-2">
          {studentNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
            >
              <Button 
                variant="ghost" 
                className={cn(
                  navButtonStyle,
                  inactiveStyle,
                  isActive(link.href) && activeStyle
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Button>
            </Link>
          ))}
        </div>
          
        {/* Acciones del usuario */}
        <div className="ml-auto flex items-center space-x-3">
          {/* <NotificationDropdown /> */}
          
          {/* Botón de cierre de sesión */}
          <Button 
            variant="default" 
            size="sm"
            className="bg-gradient-to-r from-[var(--student-primary)] to-[#f04e5c] text-white hover:shadow-md transition-all hover:scale-105"
            onClick={handleLogout}
          >
            <div className="flex items-center">
              <LogOutIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </div>
          </Button>
        </div>
      </div>
    </nav>
  )
}
