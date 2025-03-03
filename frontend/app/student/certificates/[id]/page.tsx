'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, AwardIcon, DownloadIcon, ArrowLeftIcon, GraduationCapIcon, UserIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { DocumentService } from "@/services/document.service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Certificate } from "@/types/certificate"

export default function CertificateDetailsPage({ params }: { params: { id: string } }) {
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setIsLoading(true)
        const certificateData = await DocumentService.getCertificateByCourseId(Number(params.id))
        console.log('Certificado cargado:', certificateData);
        
        if (!certificateData.id || !certificateData.name || !certificateData.hours) {
          throw new Error('Datos del certificado incompletos');
        }
        
        setCertificate(certificateData);
      } catch (error) {
        console.error('Error al cargar el certificado:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar el certificado",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadCertificate()
    }
  }, [params.id])

  // Función auxiliar para formatear la fecha de forma segura
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Fecha no disponible";
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error al formatear la fecha:', error, dateString);
      return "Fecha no disponible";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/student/certificates"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Certificados
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-[1.4/1] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="space-y-6">
        <Link 
          href="/student/certificates"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Certificados
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AwardIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Certificado no encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              El certificado que buscas no existe o no tienes acceso a él
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/student/certificates"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Certificados
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Detalles del Certificado */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold">{certificate.name}</CardTitle>
              <Badge variant="outline" className="ml-2">
                {certificate.hours} horas
              </Badge>
            </div>
            <CardDescription className="flex items-center mt-2">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(certificate.date_emission)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descripción del curso */}
            {certificate.description && (
              <div className="text-sm text-muted-foreground">
                {certificate.description}
              </div>
            )}

            {/* Información del profesor */}
            {certificate.teacher_name && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profesor
                  </h3>
                  <div className="space-y-1">
                    <p className="font-medium">{certificate.teacher_name}</p>
                    {certificate.teacher_degree && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <GraduationCapIcon className="h-4 w-4 mr-1" />
                        {certificate.teacher_degree}
                      </p>
                    )}
                    {certificate.teacher_profile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {certificate.teacher_profile}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={() => {
                toast({
                  title: "Próximamente",
                  description: "La descarga de certificados estará disponible pronto",
                })
              }}
            >
              <DownloadIcon className="mr-2 h-5 w-5" />
              Descargar Certificado
            </Button>
          </CardContent>
        </Card>

        {/* Vista Previa del Certificado */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[1.4/1] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md flex items-center justify-center">
              {certificate.file ? (
                <div className="w-full h-full flex items-center justify-center">
                  {/* Aquí irá el visor de PDF cuando esté disponible */}
                  <p className="text-sm text-muted-foreground">Vista previa no disponible</p>
                </div>
              ) : (
                <div className="text-center">
                  <AwardIcon className="h-24 w-24 text-blue-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Vista previa no disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
