import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Certificado | Aula Virtual',
  description: 'Verificación de certificado emitido por Aula Virtual',
}

export default function CertificateLayout({
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