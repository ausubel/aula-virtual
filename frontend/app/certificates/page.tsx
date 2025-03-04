'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AwardIcon, DownloadIcon, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import withCVRequired from "@/components/auth/with-cv-required"

// Datos simulados de certificados
const mockCertificates = [
  {
    id: 1,
    name: "Matemáticas Avanzadas",
    hours: 40,
    date_emission: new Date(2023, 11, 15),
    file: "/certificates/math-certificate.pdf"
  },
  {
    id: 2,
    name: "Programación Web",
    hours: 60,
    date_emission: new Date(2023, 10, 20),
    file: "/certificates/web-certificate.pdf"
  },
  {
    id: 3,
    name: "Inglés Técnico",
    hours: 30,
    date_emission: new Date(2023, 9, 5),
    file: "/certificates/english-certificate.pdf"
  }
]

function CertificatesPage() {
  const [certificates, setCertificates] = useState(mockCertificates)
  const [isLoading, setIsLoading] = useState(false)

  // Función simulada para descargar un certificado
  const handleDownload = (certificate: typeof certificates[0]) => {
    setIsLoading(true)
    
    // Simulamos una descarga
    setTimeout(() => {
      console.log(`Descargando certificado: ${certificate.name}`)
      setIsLoading(false)
      
      // En una implementación real, aquí se descargaría el archivo
      alert(`El certificado de ${certificate.name} se ha descargado correctamente.`)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis Certificados</h1>
      </div>
      
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AwardIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-center">No tienes certificados disponibles</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Completa tus cursos para obtener certificados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{certificate.name}</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {certificate.hours} horas
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-2">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {format(certificate.date_emission, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[1.4/1] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md flex items-center justify-center">
                  <AwardIcon className="h-16 w-16 text-blue-500" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleDownload(certificate)}
                  disabled={isLoading}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Descargar Certificado
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 

export default withCVRequired(CertificatesPage)