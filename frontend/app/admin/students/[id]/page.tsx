'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap, Mail, Phone, MapPin, FileText, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminService, StudentProfile, Certificate } from "@/services/admin.service"
import userService from "@/services/user.service"
import { ScrollArea } from "@/components/ui/scroll-area"
import apiClient from "@/lib/api-client"

// Tipo para los datos del perfil
interface ProfileData {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  avatar: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalProgress: number;
  certificates: {
    id: number;
    title: string;
    issueDate: string;
    instructor: string;
    image?: string;
  }[];
  currentCourses: {
    id: number;
    title: string;
    progress: number;
    instructor: string;
    image?: string;
  }[];
  location: string;
  bio: string;
  degree: string;
}

// Datos por defecto para mostrar mientras se cargan los datos reales
const defaultProfileData: ProfileData = {
  id: 0,
  name: "Cargando...",
  surname: "",
  email: "cargando@ejemplo.com",
  phone: "...",
  avatar: "",
  coursesEnrolled: 0,
  coursesCompleted: 0,
  totalProgress: 0,
  certificates: [],
  currentCourses: [],
  location: "",
  bio: "",
  degree: ""
}

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [user, setUser] = useState<ProfileData>(defaultProfileData)
  const [cv, setCV] = useState<string | null>(null)
  const [cvObjectUrl, setCvObjectUrl] = useState<string | null>(null)
  const [loadingCV, setLoadingCV] = useState(false)

  useEffect(() => {
    if (params.id) {
      getUserData()
      fetchStudentCV()
      fetchStudentCertificates()
    }
  }, [params.id])

  useEffect(() => {
    // Cleanup object URL when component unmounts or CV changes
    return () => {
      if (cvObjectUrl) {
        URL.revokeObjectURL(cvObjectUrl)
      }
    }
  }, [cvObjectUrl])

  const getUserData = async () => {
    try {
      const id = Number(params.id)
      // Hacer la petición al endpoint usando el cliente centralizado
      const response = await apiClient.get(`/user/student/${id}/profile`)
      console.log('Respuesta de perfil de estudiante:', response)
      
      // Actualizar el estado con los datos recibidos
      if (response.data) {
        // Verificar si la respuesta tiene la estructura esperada
        let profileData;
        if (response.data.data) {
          // Si la respuesta tiene un objeto data anidado (formato antiguo)
          profileData = response.data.data;
        } else {
          // Si la respuesta ya tiene el formato esperado
          profileData = response.data;
        }
        
        // Obtener datos adicionales del perfil (ubicación y biografía)
        try {
          const profileDataAdditional = await userService.getStudentProfileData(id);
          if (profileDataAdditional && profileDataAdditional.data) {
            profileData.location = profileDataAdditional.data.location || "";
            profileData.bio = profileDataAdditional.data.bio || "";
            profileData.degree = profileDataAdditional.data.degree || "";
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
        
        setUser(profileData)
      }
    } catch (error) {
      console.error("Error al obtener datos del perfil:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del perfil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentCertificates = async () => {
    try {
      const id = Number(params.id)
      const certs = await AdminService.getStudentCertificates(id)
      setCertificates(certs)
    } catch (error) {
      console.error("Error al obtener certificados del estudiante:", error)
      // No mostramos toast de error para no interrumpir la experiencia del usuario
    }
  }

  const fetchStudentCV = async () => {
    try {
      setLoadingCV(true)
      const id = Number(params.id)
      const documentResponse = await apiClient.get(`/document/student/${id}/cv`)
      console.log('Respuesta de CV de estudiante:', documentResponse)
      
      // Extract CV data
      let cvData = null;
      
      if (documentResponse.data?.data?.cv_file) {
        cvData = documentResponse.data.data;
      } else if (documentResponse.data?.data?.cv) {
        cvData = documentResponse.data.data;
      } else if (documentResponse.data?.cv_file) {
        cvData = documentResponse.data;
      } else if (documentResponse.data?.cv) {
        cvData = documentResponse.data;
      }
      
      if (cvData && (cvData.cv_file || cvData.cv)) {
        // Store original CV data
        const cvFile = cvData.cv_file || cvData.cv;
        setCV(cvFile);
        
        // Try to create a blob from the base64 data
        try {
          // Remove prefix if exists
          let base64Content = cvFile;
          if (typeof base64Content === 'string' && base64Content.includes('base64,')) {
            base64Content = base64Content.split('base64,')[1];
          }
          
          // Decode base64 and create a typed array
          const byteCharacters = atob(base64Content);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          // Create blob and object URL
          const blob = new Blob(byteArrays, { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          setCvObjectUrl(url);
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      } else {
        setCV(null);
        setCvObjectUrl(null);
      }
    } catch (error) {
      console.error("Error al obtener CV del estudiante:", error);
    } finally {
      setLoadingCV(false);
    }
  }

  const downloadCV = () => {
    if (!cv) return
    
    // Handle different CV formats
    try {
      const link = document.createElement('a')
      
      // If it's a base64 PDF
      if (typeof cv === 'string' && cv.startsWith('data:application/pdf;base64,')) {
        link.href = cv
      } 
      // If we have an object URL
      else if (cvObjectUrl) {
        link.href = cvObjectUrl
      }
      // If it's HTML content
      else {
        const blob = new Blob([String(cv)], { type: 'text/html' })
        link.href = URL.createObjectURL(blob)
      }
      
      link.download = `CV-${user.name}-${user.surname}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error descargando CV:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el CV",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Estudiante no encontrado</h2>
          <Button 
            variant="link" 
            onClick={() => router.push('/admin/students')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/admin/students')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a la lista
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Información, Cursos y Certificados */}
        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <CardTitle>Información del Estudiante</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {user.name} {user.surname}
                  </h3>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                </div>
                
                {user.bio && (
                  <div>
                    <h4 className="font-medium mb-1">Biografía</h4>
                    <p className="text-muted-foreground">{user.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Cursos Inscritos</div>
                    <div className="text-2xl font-bold">{user.coursesEnrolled}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Cursos Completados</div>
                    <div className="text-2xl font-bold">{user.coursesCompleted}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Progreso General</div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-muted rounded-full h-2.5 mr-2">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${user.totalProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{user.totalProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cursos Actuales */}
          <Card>
            <CardHeader>
              <CardTitle>Cursos Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              {user.currentCourses.length > 0 ? (
                <div className="space-y-4">
                  {user.currentCourses.map(course => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Instructor: {course.instructor}
                          </p>
                        </div>
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay cursos en progreso
                </p>
              )}
            </CardContent>
          </Card>

          {/* Certificados */}
          {certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certificados Obtenidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.map(cert => (
                    <Card key={cert.id} className="border">
                      <CardContent className="p-4">
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Duración: {cert.hours} horas
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Emitido: {new Date(cert.date_emission).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: CV del Estudiante */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <CardTitle>CV del Estudiante</CardTitle>
              </div>
              {(cv || cvObjectUrl) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadCV} 
                  className="flex items-center space-x-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingCV ? (
              <div className="flex justify-center items-center h-[calc(100vh-250px)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : cvObjectUrl ? (
              <div className="h-[calc(100vh-250px)] border rounded-md overflow-hidden">
                <object
                  data={cvObjectUrl}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <embed 
                    src={cvObjectUrl} 
                    type="application/pdf"
                    className="w-full h-full"
                  />
                  <p className="text-center p-4">
                    Si no puedes ver el PDF, puedes 
                    <Button 
                      variant="link" 
                      onClick={downloadCV}
                      className="px-1"
                    >
                      descargarlo aquí
                    </Button>
                  </p>
                </object>
              </div>
            ) : cv ? (
              <ScrollArea className="h-[calc(100vh-250px)] border rounded-md p-4">
                <div className="prose max-w-none text-center">
                  <p>El CV está en un formato que no se puede previsualizar.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadCV} 
                    className="mt-4"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar CV
                  </Button>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-30" />
                <p>El estudiante no ha subido su CV</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}