import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

// No need to define a separate layout here since the parent student layout will be used
export default function StudentCoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[2]}> {/* ID 2 corresponde al rol STUDENT según schema.sql */}
      {children}
    </ProtectedRoute>
  )
}