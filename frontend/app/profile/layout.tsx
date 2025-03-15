import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { StudentLayout } from "@/components/layouts/student-layout"
import "@/app/student/styles.css"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute> {/* Todos los usuarios autenticados pueden ver su perfil */}
      <StudentLayout>
        {children}
      </StudentLayout>
    </ProtectedRoute>
  )
}
