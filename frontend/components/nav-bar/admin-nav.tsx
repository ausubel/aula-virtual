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
  LayoutDashboardIcon,
  UsersIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"

const adminNavLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboardIcon className="size-4 mr-2" />,
  },
  {
    href: "/admin/courses",
    label: "Cursos",
    icon: <BookOpenIcon className="size-4 mr-2" />,
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: <UsersIcon className="size-4 mr-2" />,
  },
  {
    href: "/admin/profile",
    label: "Perfil",
    icon: <UserIcon className="size-4 mr-2" />,
  },
  {
    href: "/admin/settings",
    label: "Configuración",
    icon: <SettingsIcon className="size-4 mr-2" />,
  },
]

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
  

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-4">
            {/* Menú móvil */}
            <div className="md:hidden">
              <MobileNav links={adminNavLinks} />
            </div>
            
            <Link href="/admin" className="flex items-center space-x-2">
              <BookOpenIcon className="size-6" />
              <span className="text-lg font-semibold hidden sm:inline-block">Panel Administrativo</span>
            </Link>
            
            {/* Enlaces de navegación para escritorio */}
            <nav className="hidden md:flex ml-6 space-x-1">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Acciones del usuario */}
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            
            {/* Botón de cierre de sesión */}
            <Button variant="destructive" size="sm" asChild>
              <Link href="/cookie-logout" className="flex items-center">
                <LogOutIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 