"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "@/components/ui/notifications"
import { BookOpenIcon, HomeIcon, LogOutIcon } from "lucide-react"

export function NavBar() {
  const pathname = usePathname()
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
          <Button variant="ghost" size="icon" aria-label="Cerrar sesión">
            <LogOutIcon className="size-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}

