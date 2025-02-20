import type React from "react"
import { Inter } from "next/font/google"
import { NotificationToaster } from "@/components/ui/notifications"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <NotificationToaster />
        {children}
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
