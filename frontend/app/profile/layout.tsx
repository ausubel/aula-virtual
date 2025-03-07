import type React from "react"
import { StudentNavBar } from "@/components/nav-bar/student-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute> {/* Todos los usuarios autenticados pueden ver su perfil */}
      <div className="min-h-screen flex flex-col">
        <StudentNavBar />
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
