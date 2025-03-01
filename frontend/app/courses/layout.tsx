import type React from "react"
import { NavBar } from "@/components/nav-bar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute> {/* Todos los usuarios autenticados pueden ver cursos */}
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 