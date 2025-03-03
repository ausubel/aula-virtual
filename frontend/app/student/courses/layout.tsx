import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function StudentCoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[2]}> {/* ID 2 corresponde al rol STUDENT según schema.sql */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}