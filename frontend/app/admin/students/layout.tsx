import { ReactNode } from "react"

export default function StudentLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}