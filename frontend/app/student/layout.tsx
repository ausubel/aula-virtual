import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { StudentLayout } from "@/components/layouts/student-layout"
import "./styles.css"

export default function StudentPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[2]}> {/* Asumiendo que el rol 2 es estudiante */}
      <StudentLayout>
        {children}
      </StudentLayout>
    </ProtectedRoute>
  )
}
