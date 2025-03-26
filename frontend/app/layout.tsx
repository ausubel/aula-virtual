import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: 'Aula Virtual',
  description: 'Plataforma de aprendizaje en línea',
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 http://backend:3002 https://fonts.gstatic.com data: blob:; img-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self' blob: data:; media-src 'self' blob: data:; object-src 'self' blob: data:;" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Toaster richColors position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
