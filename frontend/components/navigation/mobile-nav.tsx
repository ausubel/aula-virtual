"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          href="/dashboard"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <span className="font-bold">Aula Virtual</span>
        </Link>
        <div className="flex flex-col space-y-3 mt-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10",
                pathname === route.href && "text-primary bg-primary/10"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              <span>{route.label}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
} 