import type React from "react"
import { AdminNavBar } from "@/components/nav-bar/admin-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[1]}> {/* Asumiendo que el rol 1 es admin */}
      <div className="min-h-screen flex flex-col">
        <AdminNavBar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
