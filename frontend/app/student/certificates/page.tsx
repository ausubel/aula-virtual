'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AwardIcon, DownloadIcon, CalendarIcon, EyeIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getToken } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"
import { useToast } from "@/hooks/use-toast"
import { DocumentService } from "@/services/document.service"
import Link from "next/link"

interface Certificate {
  id: number;
  name: string;
  hours: number;
  date_emission: Date;
  file?: string;
}

interface DecodedToken {
  userId: number;
  userRoleId: number;
  iat?: number;
  exp?: number;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadStudentCertificates = async (userId: number) => {
    try {
      setIsLoading(true)
      const data = await DocumentService.getAllCertificatesByStudentId(userId)
      console.log('Certificados cargados:', data)
      setCertificates(data || [])
    } catch (error) {
      console.error('Error al cargar los certificados:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los certificados",
        variant: "destructive"
      })
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
          console.log('ID del estudiante:', decoded.userId)
          loadStudentCertificates(decoded.userId)
        } else {
          console.error('El token no contiene userId')
          toast({
            title: "Error",
            description: "No se pudo identificar al usuario",
            variant: "destructive"
          })
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        toast({
          title: "Error",
          description: "Error al verificar la identidad del usuario",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    } else {
      console.log('No se encontró el token')
      toast({
        title: "Error",
        description: "No hay sesión activa",
        variant: "destructive"
      })
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
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => console.log('Descargar certificado:', certificate.id)}
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
