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
  certificates: Certificate[];
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
  const [user, setUser] = useState<ProfileData>(defaultProfileData)
  const [cv, setCV] = useState<string | null>(null)
  const [cvObjectUrl, setCvObjectUrl] = useState<string | null>(null)
  const [loadingCV, setLoadingCV] = useState(false)

  useEffect(() => {
    if (params.id) {
      getUserData()
      fetchStudentCV()
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
      setLoading(true)
      const id = Number(params.id)
      console.log(`Obteniendo datos del estudiante ${id}`)
      
      // Hacer la petición directamente al endpoint correcto
      const response = await apiClient.get(`/api/user/student/${id}/profile`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      console.log('Respuesta de perfil de estudiante:', response)
      
      // Extraer los datos del perfil
      let studentData;
      if (response.data?.data) {
        studentData = response.data.data;
      } else {
        studentData = response.data;
      }
      
      console.log('Datos del estudiante extraídos:', studentData)
      
      // Convertir los datos a ProfileData
      const profileData: ProfileData = {
        id: studentData.id || id,
        name: studentData.name || 'Sin nombre',
        surname: studentData.surname || '',
        email: studentData.email || '',
        phone: studentData.phone || '',
        avatar: studentData.avatar || '',
        coursesEnrolled: studentData.coursesEnrolled || 0,
        coursesCompleted: studentData.coursesCompleted || 0,
        totalProgress: studentData.totalProgress || 0,
        certificates: [],  // Se llena con fetchStudentCertificates
        currentCourses: studentData.currentCourses?.map((course: any) => ({
          id: course.id,
          title: course.title,
          progress: course.progress,
          instructor: course.instructor,
          image: ''
        })) || [],
        location: studentData.location || '',
        bio: studentData.bio || '',
        degree: ''
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
        console.error("Error al obtener datos adicionales del perfil:", error);
      }
      
      setUser(profileData)
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


  const fetchStudentCV = async () => {
    try {
      setLoadingCV(true)
      const id = Number(params.id)
      console.log(`Solicitando CV del estudiante ${id}`)
      
      // Usar la ruta correcta para obtener el CV
      const response = await apiClient.get(`/api/document/student/${id}/cv`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Respuesta de CV recibida:', response.status)
      
      // Extraer el contenido del CV de la respuesta
      let cvContent = null;
      
      // Buscar el contenido del CV en diferentes estructuras posibles
      // Primero verificar la estructura que vemos en la captura: data.data.cv.cv_file
      if (response.data?.data?.cv?.cv_file) {
        cvContent = response.data.data.cv.cv_file;
        console.log('CV encontrado en data.data.cv.cv_file');
      } else if (response.data?.data?.cv_file) {
        cvContent = response.data.data.cv_file;
        console.log('CV encontrado en data.data.cv_file');
      } else if (response.data?.data?.cv) {
        cvContent = response.data.data.cv;
        console.log('CV encontrado en data.data.cv');
      } else if (response.data?.cv_file) {
        cvContent = response.data.cv_file;
        console.log('CV encontrado en data.cv_file');
      } else if (response.data?.cv) {
        cvContent = response.data.cv;
        console.log('CV encontrado en data.cv');
      } else if (typeof response.data === 'string') {
        cvContent = response.data;
        console.log('CV encontrado como string directo');
      }
      
      // Imprimir la estructura de la respuesta para depuración
      console.log('Estructura de respuesta:', JSON.stringify(response.data, null, 2));
      
      if (!cvContent) {
        console.log('No se encontró contenido de CV')
        setCV(null)
        setCvObjectUrl(null)
        setLoadingCV(false)
        return
      }
      
      // Guardar el contenido original
      setCV(cvContent)
      
      // Procesar el contenido para mostrarlo
      try {
        // Asegurarse de que tenemos un string
        if (typeof cvContent !== 'string') {
          throw new Error('El contenido del CV no es un string')
        }
        
        // Verificar si ya tiene el prefijo MIME
        if (cvContent.startsWith('data:application/pdf;base64,')) {
          // Ya tiene el prefijo, usarlo directamente
          setCvObjectUrl(cvContent)
        } else {
          // Añadir el prefijo MIME necesario para visualizar el PDF
          const fullContent = `data:application/pdf;base64,${cvContent}`
          console.log('Prefijo MIME añadido al CV')
          
          // Intentar crear un blob para mejor compatibilidad
          try {
            // Extraer solo la parte base64
            let base64Content = cvContent;
            
            // Añadir padding si es necesario
            while (base64Content.length % 4 !== 0) {
              base64Content += '=';
            }
            
            // Decodificar y crear el blob
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
            
            const blob = new Blob(byteArrays, { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setCvObjectUrl(url);
            console.log('URL de objeto creada mediante blob');
          } catch (blobError) {
            console.error('Error al crear blob:', blobError);
            // Si falla, usar el string con prefijo MIME directamente
            setCvObjectUrl(fullContent);
          }
        }
        
        console.log('CV procesado correctamente')
      } catch (error) {
        console.error('Error al procesar el CV:', error)
        // Mantener el CV original para poder descargarlo
        setCvObjectUrl(null)
      }
    } catch (error) {
      console.error('Error al obtener el CV:', error)
      setCV(null)
      setCvObjectUrl(null)
    } finally {
      setLoadingCV(false)
    }
  }

  const downloadCV = async () => {
    try {
      if (!cv) {
        toast({
          title: "Error",
          description: "No hay CV disponible para descargar",
          variant: "destructive"
        })
        return
      }
      
      // Crear un enlace para descargar el PDF
      const link = document.createElement('a')
      
      // Determinar la URL a usar para la descarga
      if (typeof cv === 'string') {
        // Verificar si ya tiene el prefijo MIME
        let downloadUrl = cv
        if (!cv.startsWith('data:')) {
          // Añadir el prefijo MIME si no lo tiene
          downloadUrl = `data:application/pdf;base64,${cv}`
        }
        link.href = downloadUrl
      } else if (cvObjectUrl) {
        // Usar la URL del objeto si estu00e1 disponible
        link.href = cvObjectUrl
      } else {
        throw new Error('No se pudo generar la URL de descarga')
      }
      
      // Establecer el nombre del archivo
      link.download = `CV-${user.name || 'Estudiante'}-${user.surname || ''}.pdf`
      
      // Simular clic para descargar
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Notificar u00e9xito
      toast({
        title: "u00c9xito",
        description: "CV descargado correctamente",
        variant: "default"
      })
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
              <div className="flex flex-col h-[calc(100vh-250px)]">
                <div className="flex-1 border rounded-md overflow-hidden">
                  {/* Usar object con fallback para mejor compatibilidad */}
                  <object
                    data={cvObjectUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center mb-4">
                        No se puede mostrar el PDF en este navegador.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={downloadCV} 
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar CV
                      </Button>
                    </div>
                  </object>
                </div>
                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadCV} 
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV
                  </Button>
                </div>
              </div>
            ) : cv ? (
              <ScrollArea className="h-[calc(100vh-250px)] border rounded-md p-4">
                <div className="prose max-w-none text-center">
                  <p>El CV estu00e1 en un formato que no se puede previsualizar.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadCV} 
                    className="mt-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV
                  </Button>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] border rounded-md p-4">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-2">
                  Este estudiante au00fan no ha subido su CV.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}