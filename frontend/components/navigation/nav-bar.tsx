"use client";

import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface NavBarProps {
  className?: string;
}

export function NavBar({ className }: NavBarProps) {
  return (
    <div className={cn("fixed z-50 top-0 w-full border-b bg-background", className)}>
      <div className="flex h-16 items-center px-4">
        <div className="md:hidden">
          <MobileNav />
        </div>
        
        <div className="flex items-center space-x-2 mr-4">
          <Link href="/dashboard" className="font-semibold text-xl hidden md:block">
            Aula Virtual
          </Link>
        </div>
        
        <div className="hidden md:block flex-1">
          <MainNav />
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative w-64 hidden md:flex">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 rounded-full bg-muted"
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <ModeToggle />
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  );
} 