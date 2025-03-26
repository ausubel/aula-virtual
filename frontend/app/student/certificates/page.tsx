'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AwardIcon, DownloadIcon, CalendarIcon, EyeIcon, Share2Icon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getToken } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"
import { toast } from "sonner"
import { DocumentService } from "@/services/document.service"
import Link from "next/link"
import withCVRequired from "@/components/auth/with-cv-required"

interface Certificate {
  id: number;
  name: string;
  hours: number;
  date_emission: Date;
  file?: string;
  uuid?: string;
}

interface DecodedToken {
  userId: number;
  userRoleId: number;
  iat?: number;
  exp?: number;
}

function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadStudentCertificates = async (userId: number) => {
    try {
      setIsLoading(true)
      const data = await DocumentService.getAllCertificatesByStudentId(userId)
      // Transform date_emission from string to Date
      const transformedData = data?.map(cert => ({
        ...cert,
        date_emission: new Date(cert.date_emission)
      })) || []
      setCertificates(transformedData)
    } catch (error) {
      console.error('Error al cargar los certificados:', error)
      toast.error("No se pudieron cargar los certificados")
      setCertificates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        if (decoded && decoded.userId) {
          loadStudentCertificates(decoded.userId)
        } else {
          console.error('El token no contiene userId')
          toast.error("No se pudo identificar al usuario")
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        toast.error("Error al verificar la identidad del usuario")
        setIsLoading(false)
      }
    } else {
      toast.error("No hay sesión activa")
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando certificados...</div>
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
                  {format(new Date(certificate.date_emission), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/student/certificates/${certificate.id}`}>
                  <div className="aspect-[1.4/1] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md flex items-center justify-center group cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors">
                    <div className="relative">
                      <AwardIcon className="h-16 w-16 text-blue-500" />
                      <EyeIcon className="absolute bottom-0 right-0 h-6 w-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => {
                    // TODO: Implementar la descarga del certificado
                  }}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Descargar Certificado
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    const certificateUrl = `${window.location.origin}/certificates/${certificate.uuid || 'sample-uuid'}`;
                    try {
                      await navigator.clipboard.writeText(certificateUrl);
                      toast.success("¡Enlace copiado!", {
                        description: "El enlace del certificado ha sido copiado al portapapeles",
                        duration: 3000,
                      });
                    } catch (error) {
                      toast.error("Error al copiar", {
                        description: "No se pudo copiar el enlace al portapapeles",
                        duration: 3000,
                      });
                    }
                  }}
                >
                  <Share2Icon className="h-4 w-4 mr-2" />
                  Compartir Certificado
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
