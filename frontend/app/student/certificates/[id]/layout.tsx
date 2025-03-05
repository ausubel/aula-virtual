import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CertificateDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[2]}> {/* Solo estudiantes pueden ver certificados */}
      <div className="container mx-auto px-4 py-1">
        {children}
      </div>
    </ProtectedRoute>
  )
}
