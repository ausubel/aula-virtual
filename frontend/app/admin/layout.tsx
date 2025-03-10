'use client';
import { AdminNavBar } from "@/components/nav-bar/admin-nav";
import {ProtectedRoute} from "@/components/auth/protected-route";

// Importamos los estilos CSS para la sección de administración
import "./styles.css";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={[1]}>
      <div className="admin-layout min-h-screen flex flex-col">
        <AdminNavBar />
        <main className="flex-grow p-4 md:p-6 bg-[var(--admin-background)]">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
        <footer className="bg-[var(--admin-dark)] text-[var(--admin-background)] p-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Aula Virtual - Panel de Administración</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
