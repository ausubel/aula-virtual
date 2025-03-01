"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Book, 
  GraduationCap, 
  Calendar, 
  Award, 
  Settings, 
  MessageSquare,
  User
} from "lucide-react";

const routes = [
  {
    label: "Inicio",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Cursos",
    icon: Book,
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
  }
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === route.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          <route.icon className={cn("h-4 w-4 mr-2", route.color)} />
          {route.label}
        </Link>
      ))}
    </nav>
  );
} 