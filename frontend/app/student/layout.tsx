import type React from "react"
import { StudentNavBar } from "@/components/nav-bar/student-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[2]}> {/* Asumiendo que el rol 2 es estudiante */}
      <div className="min-h-screen flex flex-col">
        <StudentNavBar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

