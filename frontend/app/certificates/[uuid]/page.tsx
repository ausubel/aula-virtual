'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, AwardIcon, DownloadIcon, ArrowLeftIcon, GraduationCapIcon, UserIcon, BookmarkIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Certificate } from "@/types/certificate"
import apiClient from "@/lib/api-client"

export default function PublicCertificateDetailsPage({ params }: { params: { uuid: string } }) {
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar el certificado por UUID
  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Usar la API interna de Next.js
        const url = `/certificate/public/${params.uuid}`;
        
        const response = await apiClient.get(url);
        
        if (response.status !== 200) {
          if (response.status === 404) {
            throw new Error('Certificado no encontrado');
          }
          console.error('Error en la respuesta:', response.data);
          throw new Error(`Error al obtener certificado: ${response.status}`);
        }
        
        const data = response.data;
        
        if (data && data.data && data.data.certificate) {
          setCertificate(data.data.certificate);
        } else {
          console.error('Formato de respuesta inválido:', data);
          throw new Error('Formato de respuesta inválido');
        }
      } catch (error) {
        console.error('Error al cargar el certificado:', error)
        setError('No se pudo encontrar el certificado solicitado')
        toast({
          title: "Error",
          description: "No se pudo cargar el certificado",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.uuid) {
      loadCertificate()
    }
  }, [params.uuid, toast])

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Fecha no disponible'
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
    } catch (error) {
      console.error('Error al formatear fecha:', error)
      return 'Fecha no disponible'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-[300px] w-full rounded-md" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Certificado no encontrado</CardTitle>
            <CardDescription>
              No se pudo encontrar el certificado con el identificador proporcionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AwardIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-center">El certificado solicitado no existe o no está disponible</p>
            <p className="text-sm text-muted-foreground text-center mt-1 mb-6">
              Por favor, verifica el enlace e intenta nuevamente
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Certificado</h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{certificate.name}</CardTitle>
              <CardDescription className="mt-1 text-base">
                {certificate.description || "Certificado de finalización de curso"}
              </CardDescription>
            </div>
            <Badge className="text-sm px-3 py-1">
              {certificate.hours} horas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vista previa del certificado */}
          <div className="aspect-[1.4/1] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md flex items-center justify-center p-8 border">
            <div className="text-center space-y-4">
              <AwardIcon className="h-20 w-20 text-primary mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Certificado de Finalización</h3>
                <p className="text-muted-foreground">{certificate.name}</p>
                <p className="text-sm">Otorgado a: <span className="font-medium">{certificate.student_name}</span></p>
                <p className="text-sm">Fecha: {formatDate(certificate.date_emission)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles del certificado */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Estudiante
              </h3>
              <p className="text-muted-foreground">{certificate.student_name || "No disponible"}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Fecha de emisión
              </h3>
              <p className="text-muted-foreground">{formatDate(certificate.date_emission)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <GraduationCapIcon className="h-4 w-4" />
                Instructor
              </h3>
              <p className="text-muted-foreground">{certificate.teacher_name || "No disponible"}</p>
              {certificate.teacher_degree && (
                <p className="text-xs text-muted-foreground">{certificate.teacher_degree}</p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <BookmarkIcon className="h-4 w-4" />
                Horas de formación
              </h3>
              <p className="text-muted-foreground">{certificate.hours} horas</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
} 