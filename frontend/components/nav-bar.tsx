"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "@/components/ui/notifications"
import { BookOpenIcon, HomeIcon, LogOutIcon } from "lucide-react"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <nav className="border-b" role="navigation">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" aria-label="Ir a inicio">
            <BookOpenIcon className="size-6" />
          </Link>
          <span className="text-lg font-semibold">{isAdmin ? "Panel Administrativo" : "Aula Virtual"}</span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <NotificationDropdown />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Ir a inicio">
              <HomeIcon className="size-5" />
            </Link>
          </Button>
          
          {/* Único botón de cierre de sesión */}
          <Button variant="destructive" asChild>
            <Link href="/cookie-logout">
              <LogOutIcon className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
