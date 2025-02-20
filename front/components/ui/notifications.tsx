"use client"

import * as React from "react"
import { Toaster } from "sonner"
import { Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success"
  date: string
  read: boolean
}

export function NotificationToaster() {
  return <Toaster richColors position="top-right" />
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      title: "Nueva evaluación disponible",
      message: "La evaluación del módulo 2 ya está disponible",
      type: "info",
      date: "Hace 5 minutos",
      read: false,
    },
    {
      id: "2",
      title: "¡Felicitaciones!",
      message: "Has completado el módulo 1 exitosamente",
      type: "success",
      date: "Hace 2 horas",
      read: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Ver notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-[300px] p-4">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg ${notification.read ? "bg-muted" : "bg-accent"}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">{notification.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No hay notificaciones</p>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

