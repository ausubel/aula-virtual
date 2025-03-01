import type React from "react"
import { NavBar } from "@/components/nav-bar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[1]}> {/* Solo administradores pueden ver usuarios */}
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 