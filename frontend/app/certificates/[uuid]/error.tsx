'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AwardIcon, ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en la página de certificados:', error)
  }, [error])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error al cargar el certificado</CardTitle>
          <CardDescription>
            No se pudo cargar el certificado solicitado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AwardIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-center">Ocurrió un error al intentar cargar el certificado</p>
          <p className="text-sm text-muted-foreground text-center mt-1 mb-6">
            Por favor, verifica el enlace e intenta nuevamente
          </p>
          <div className="flex gap-4">
            <Button onClick={() => reset()}>
              Intentar nuevamente
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 