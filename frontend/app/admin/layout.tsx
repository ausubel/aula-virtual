import type React from "react"
import { NavBar } from "@/components/nav-bar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[1]}> {/* Asumiendo que el rol 1 es admin */}
      <div className="min-h-screen flex flex-col">
        <NavBar />
        {children}
      </div>
    </ProtectedRoute>
  )
}
