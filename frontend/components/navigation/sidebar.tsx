"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  Settings,
  MessageSquare,
  User,
  PlusCircle,
} from "lucide-react";

const routes = [
  {
    label: "Panel Principal",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Mis Cursos",
    icon: BookOpen,
    href: "/courses",
    color: "text-violet-500",
  },
  {
    label: "Calificaciones",
    icon: GraduationCap,
    href: "/grades",
    color: "text-pink-700",
  },
  {
    label: "Calendario",
    icon: Calendar,
    href: "/calendar",
    color: "text-orange-500",
  },
  {
    label: "Certificados",
    icon: Award,
    href: "/certificates",
    color: "text-emerald-500",
  },
  {
    label: "Mensajes",
    icon: MessageSquare,
    href: "/messages",
    color: "text-blue-500",
  },
  {
    label: "Perfil",
    icon: User,
    href: "/profile",
    color: "text-yellow-500",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 border-r h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navegación
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Descubre
          </h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <PlusCircle className="mr-2 h-5 w-5" />
              Explorar Cursos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 