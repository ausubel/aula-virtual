import type React from "react"
import { StudentNavBar } from "@/components/nav-bar/student-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={[2]}> {/* Solo estudiantes pueden ver certificados */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 