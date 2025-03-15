import type React from "react"
import { StudentNavBar } from "@/components/nav-bar/student-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 