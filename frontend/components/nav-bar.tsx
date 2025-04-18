"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "@/components/ui/notifications"
import { 
  BookOpenIcon, 
  HomeIcon, 
  LogOutIcon, 
  UserIcon, 
  SettingsIcon, 
  LayoutDashboardIcon,
  AwardIcon,
  UsersIcon,
  BellIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserRole } from "@/lib/auth"
import { MobileNav } from "@/components/mobile-nav"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith("/admin")
  const userRole = getUserRole()

  // Definir los enlaces de navegación según el rol del usuario
  const navLinks = [
    {
      href: "/courses",
      label: "Cursos",
      icon: <BookOpenIcon className="size-4 mr-2" />,
      active: pathname.startsWith("/courses"),
      roles: [1, 2] // Todos los roles
    },
    {
      href: "/profile",
      label: "Perfil",
      icon: <UserIcon className="size-4 mr-2" />,
      active: pathname.startsWith("/profile"),
      roles: [1, 2] // Todos los roles
    },
    {
      href: "/certificates",
      label: "Certificados",
      icon: <AwardIcon className="size-4 mr-2" />,
      active: pathname.startsWith("/certificates"),
      roles: [2] // Solo estudiantes
    },
    {
      href: "/users",
      label: "Usuarios",
      icon: <UsersIcon className="size-4 mr-2" />,
      active: pathname.startsWith("/users"),
      roles: [1] // Solo administradores
    },
    {
      href: "/settings",
      label: "Configuración",
      icon: <SettingsIcon className="size-4 mr-2" />,
      active: pathname.startsWith("/settings"),
      roles: [1, 2] // Todos los roles
    },
  ]

  // Filtrar enlaces según el rol del usuario
  const filteredLinks = navLinks.filter(link => 
    link.roles.includes(userRole || 2) // Si no hay rol, asumimos estudiante (2)
  )

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-4">
            {/* Menú móvil */}
            <div className="md:hidden">
              <MobileNav links={filteredLinks} />
            </div>
            
            <Link href="/" className="flex items-center space-x-2" aria-label="Ir a inicio">
              <BookOpenIcon className="size-6" />
              <span className="text-lg font-semibold hidden sm:inline-block">{isAdmin ? "Panel Administrativo" : "Aula Virtual"}</span>
            </Link>
            
            {/* Enlaces de navegación para escritorio */}
            <nav className="hidden md:flex ml-6 space-x-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    link.active
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
