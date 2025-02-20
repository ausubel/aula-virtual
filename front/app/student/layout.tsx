import type React from "react"
import { NavBar } from "@/components/nav-bar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {children}
    </div>
  )
}

