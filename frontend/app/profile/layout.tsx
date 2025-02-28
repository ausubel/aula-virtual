import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute> {/* Cualquier usuario autenticado puede acceder */}
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ProtectedRoute>
  )
}
