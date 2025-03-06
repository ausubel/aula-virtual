'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EditIcon, MailIcon, PhoneIcon, MapPinIcon, AwardIcon, BookOpenIcon, GraduationCapIcon, FileIcon, DownloadIcon } from "lucide-react"
import withCVRequired from "@/components/auth/with-cv-required"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import { SweetAlert } from "@/utils/SweetAlert"

// Tipo para los datos del perfil
interface ProfileData {
  name: string;
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
}

// Datos por defecto para mostrar mientras se cargan los datos reales
const defaultProfileData: ProfileData = {
  name: "Cargando...",
  email: "cargando@ejemplo.com",
  phone: "...",
  avatar: "",
  coursesEnrolled: 0,
  coursesCompleted: 0,
  totalProgress: 0,
  certificates: [],
  currentCourses: []
}

function ProfilePage() {
  const [user, setUser] = useState<ProfileData>(defaultProfileData)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const id = Number(Cookies.get('user_id'))
        console.log('ID del usuario:', id)
        // Hacer la petición al endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user/student/${id}/profile`)
        console.log(response)
        // Actualizar el estado con los datos recibidos
        if (response.data && response.data.data) {
          // Añadir imágenes temporales para los certificados y cursos
          const profileData = response.data.data
          
          // Añadir imágenes temporales para los certificados
          if (profileData.certificates) {
            profileData.certificates = profileData.certificates.map((cert: any) => ({
              ...cert,
              image: cert.image || "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGF0YWJhc2V8ZW58MHx8MHx8fDA%3D"
            }))
          }
          
          // Añadir imágenes temporales para los cursos actuales
          if (profileData.currentCourses) {
            profileData.currentCourses = profileData.currentCourses.map((course: any) => ({
              ...course,
              image: course.image || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kaW5nfGVufDB8fDB8fHww"
            }))
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

    fetchProfileData()
  }, [toast])

  // Función para descargar el CV del usuario
  const downloadCV = async () => {
    try {
      const userId = Number(Cookies.get('user_id'))
      
      // Mostrar un indicador de carga
      SweetAlert.info("Descargando CV", "Por favor espera mientras preparamos tu CV para descargar...")
      
      // Hacer la petición al endpoint para obtener el CV
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/document/student/${userId}/cv`)
      console.log(response)
      if (response.data && response.data.data && response.data.data.cv) {
        // Obtener el contenido base64 del CV
        const base64Content = response.data.data.cv.cv_file
        console.log(base64Content)
        // Crear un objeto Blob con el contenido del PDF
        const byteCharacters = atob(base64Content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        
        // Crear una URL para el blob
        const url = URL.createObjectURL(blob)
        
        // Crear un enlace para descargar el archivo
        const link = document.createElement('a')
        link.href = url
        link.download = `CV_${user.name.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(link)
        link.click()
        
        // Limpiar
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        SweetAlert.success("Descarga completada", "Tu CV ha sido descargado correctamente")
      } else {
        throw new Error("No se pudo obtener el CV")
      }
    } catch (error) {
      console.error("Error al descargar el CV:", error)
      SweetAlert.error("Error", "No se pudo descargar el CV. Inténtalo de nuevo más tarde.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Button variant="outline">
          <EditIcon className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de información personal */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>
              <Badge className="mt-1">Estudiante</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div>
            
            {/* Botón para descargar CV */}
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={downloadCV}
              disabled={loading}
            >
              <FileIcon className="h-4 w-4 mr-2" />
              Descargar mi CV
            </Button>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{user.coursesEnrolled}</p>
                  <p className="text-xs text-muted-foreground">Cursos Inscritos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.coursesCompleted}</p>
                  <p className="text-xs text-muted-foreground">Cursos Completados</p>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
          
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="progress">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="progress">Progreso</TabsTrigger>
                <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
                <TabsTrigger value="certificates">Certificados</TabsTrigger>
              </TabsList>
              
              {/* Pestaña de Progreso */}
              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Progreso General</CardTitle>
                    <CardDescription>Tu progreso en todos los cursos inscritos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Progreso Total</span>
                        <span className="text-sm font-medium">{user.totalProgress}%</span>
                      </div>
                      <Progress value={user.totalProgress} className="h-2" />
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-medium">Cursos en Progreso</h3>
                      {user.currentCourses.map((course) => (
                        <div key={course.id} className="flex items-start space-x-4 py-3 border-t">
                          <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={course.image} 
                              alt={course.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{course.title}</h4>
                            <p className="text-xs text-muted-foreground">{course.instructor}</p>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progreso</span>
                                <span>{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-1.5" />
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="flex-shrink-0">
                            Continuar
                          </Button>
                        </div>
                      ))}
                      
                      {user.currentCourses.length === 0 && !loading && (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">No tienes cursos en progreso</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de Cursos */}
              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Cursos</CardTitle>
                    <CardDescription>Cursos en los que estás inscrito</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Cursos en Progreso ({user.currentCourses.length})</h3>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Ver todos
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.currentCourses.map((course) => (
                          <Card key={course.id} className="overflow-hidden">
                            <div className="h-32 overflow-hidden">
                              <img 
                                src={course.image} 
                                alt={course.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-medium line-clamp-1">{course.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Progreso</span>
                                  <span>{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-1.5" />
                              </div>
                              <Button size="sm" className="w-full mt-3">
                                <BookOpenIcon className="h-3 w-3 mr-2" />
                                Continuar
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {user.currentCourses.length === 0 && !loading && (
                          <div className="col-span-2 text-center py-6">
                            <p className="text-sm text-muted-foreground">No tienes cursos en progreso</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <h3 className="text-sm font-medium">Cursos Completados ({user.coursesCompleted})</h3>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Ver todos
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.certificates.map((cert) => (
                          <Card key={cert.id} className="overflow-hidden">
                            <div className="h-32 overflow-hidden">
                              <img 
                                src={cert.image} 
                                alt={cert.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-medium line-clamp-1">{cert.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{cert.instructor}</p>
                              <div className="flex justify-between items-center mt-3">
                                <Badge variant="outline" className="bg-green-50">Completado</Badge>
                                <Button size="sm" variant="outline">
                                  <GraduationCapIcon className="h-3 w-3 mr-2" />
                                  Ver Certificado
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {user.certificates.length === 0 && !loading && (
                          <div className="col-span-2 text-center py-6">
                            <p className="text-sm text-muted-foreground">No tienes cursos completados</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de Certificados */}
              <TabsContent value="certificates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Certificados</CardTitle>
                    <CardDescription>Certificados obtenidos por completar cursos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.certificates.map((cert) => (
                        <div key={cert.id} className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                            <Button variant="secondary" className="mb-4">
                              <AwardIcon className="h-4 w-4 mr-2" />
                              Ver Certificado
                            </Button>
                          </div>
                          <Card className="overflow-hidden h-full">
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={cert.image} 
                                alt={cert.title} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-medium">{cert.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">Instructor: {cert.instructor}</p>
                              <div className="flex items-center mt-3">
                                <AwardIcon className="h-4 w-4 mr-2 text-amber-500" />
                                <span className="text-xs">Emitido el {cert.issueDate}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                    
                    {user.certificates.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <AwardIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No tienes certificados aún</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Completa cursos para obtener certificados
                        </p>
                        <Button className="mt-4">
                          Explorar Cursos
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  )
}

export default withCVRequired(ProfilePage)