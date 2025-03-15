import React from 'react';
import { StudentNavBar } from "@/components/nav-bar/student-nav";
import "@/app/student/styles.css";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col student-layout">
      <StudentNavBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="py-5 text-center">
        <div className="container mx-auto">
          <p className="text-sm opacity-70">© {new Date().getFullYear()} Aula Virtual. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
