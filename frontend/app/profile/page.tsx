'use client'

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EditIcon, MailIcon, PhoneIcon, MapPinIcon, AwardIcon, BookOpenIcon, GraduationCapIcon, FileIcon, DownloadIcon, CameraIcon, UploadIcon, MoveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"
import withCVRequired from "@/components/auth/with-cv-required"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import { SweetAlert } from "@/utils/SweetAlert"
import { DocumentService } from "@/services/document.service"
import userService from "@/services/user.service"


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

function ProfilePage() {
  const [user, setUser] = useState<ProfileData>(defaultProfileData)
  const [loading, setLoading] = useState(true)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    getUserData()
  }, [])

  // Función para cargar la foto de perfil
  const loadProfilePhoto = async (userId: number) => {
    try {
      const photoBase64 = await DocumentService.getProfilePhoto(userId)
      if (photoBase64) {
        // Actualizar el estado del usuario con la foto
        setUser(prevUser => ({
          ...prevUser,
          avatar: `data:image/jpeg;base64,${photoBase64}`
        }))
      }
    } catch (error) {
      console.error("Error al cargar la foto de perfil:", error)
    }
  }

  // Función para convertir archivo a base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = reader.result as string
        // Extraer solo la parte base64 sin el prefijo MIME
        const base64Content = base64String.split(',')[1]
        resolve(base64Content)
      }
      reader.onerror = error => reject(error)
    })
  }

  // Función para manejar la selección de archivos
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive"
      })
      return
    }
    
    // Validar el tamaño de la imagen (máximo 1MB)
    const ONE_MB = 1024 * 1024
    if (file.size > ONE_MB) {
      toast({
        title: "Error",
        description: "La imagen no debe exceder 1MB de tamaño",
        variant: "destructive"
      })
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    try {
      // Crear URL para vista previa
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)
      
      // No subimos la imagen inmediatamente, esperamos a que el usuario confirme
    } catch (error) {
      console.error("Error al generar vista previa:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la vista previa de la imagen",
        variant: "destructive"
      })
    }
  }

  // Función para subir la foto después de la vista previa
  const uploadPhoto = async () => {
    if (!previewImage) return
    
    try {
      setPhotoLoading(true)
      // Mostrar indicador de carga
      SweetAlert.info("Subiendo foto", "Por favor espera mientras subimos tu foto de perfil...")
      
      // Obtener el archivo del input
      const file = fileInputRef.current?.files?.[0]
      if (!file) return
      
      // Convertir a base64
      const base64Content = await convertFileToBase64(file)
      
      // Subir al servidor
      const userId = Number(Cookies.get('user_id'))
      await DocumentService.uploadProfilePhoto(base64Content, userId)
      
      // Actualizar la vista con la nueva foto
      setUser(prevUser => ({
        ...prevUser,
        avatar: `data:${file.type};base64,${base64Content}`
      }))
      
      // Limpiar la vista previa y resetear posición
      setPreviewImage(null)
      setImagePosition({ x: 0, y: 0 })
      setImageScale(1)
      
      SweetAlert.success("Foto actualizada", "Tu foto de perfil ha sido actualizada correctamente")
    } catch (error) {
      console.error("Error al subir la foto:", error)
      SweetAlert.error("Error", "No se pudo subir la foto de perfil. Inténtalo de nuevo más tarde.")
    } finally {
      setPhotoLoading(false)
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Función para cancelar la subida de la foto
  const cancelPhotoUpload = () => {
    setPreviewImage(null)
    setImagePosition({ x: 0, y: 0 })
    setImageScale(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Funciones para manejar el arrastre de la imagen
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    setImagePosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Funciones para manejar el zoom de la imagen
  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.1, 0.5))
  }

  // Función para resetear la posición y el zoom
  const resetImagePosition = () => {
    setImagePosition({ x: 0, y: 0 })
    setImageScale(1)
  }

  // Función para activar el selector de archivos
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

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

  // Función para actualizar la información del perfil
  const updateProfileInfo = async () => {
    try {
      // Validar la longitud de la biografía
      if (user.bio && user.bio.length > 500) {
        toast({
          title: "Error",
          description: "La biografía no debe exceder los 500 caracteres",
          variant: "destructive"
        });
        return;
      }
      
      const response = await userService.updateStudentProfileInfo(user.id, user.name, user.surname, user.phone, user.location, user.bio);
      
      if (response.status === 200) {
        // Cerrar indicador de carga y mostrar éxito
        SweetAlert.success("Perfil actualizado", "Tu información de perfil ha sido actualizada correctamente");
        
        // Recargar los datos del perfil para mostrar la información actualizada
        getUserData();
      }
    } catch (error) {
      console.error("Error updating profile info:", error);
      SweetAlert.error("Error", "No se pudo actualizar la información del perfil. Inténtalo de nuevo más tarde.");
    }
  };

  const getUserData = async () => {
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
        
        // Cargar la foto de perfil
        loadProfilePhoto(id)
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

  return (
    <div className="space-y-6">
      {/* Modal de vista previa de la foto */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-medium">Vista previa de la foto</h3>
            <p className="text-sm text-muted-foreground">
              Mueve la imagen para ajustar su posición y utiliza los controles para hacer zoom.
              <span className="block mt-1 text-xs text-amber-600">Tamaño máximo: 1MB</span>
            </p>
            
            <div className="flex justify-center">
              <div 
                ref={imageContainerRef}
                className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-primary cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                  src={previewImage} 
                  alt="Vista previa" 
                  className="absolute w-full h-full object-cover transition-transform"
                  style={{ 
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                    transformOrigin: 'center'
                  }}
                  draggable="false"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <MoveIcon className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            
            {/* Controles de zoom */}
            <div className="flex justify-center space-x-4 mt-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomOut}
                disabled={imageScale <= 0.5}
              >
                <ZoomOutIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetImagePosition}
              >
                Restablecer
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomIn}
                disabled={imageScale >= 2}
              >
                <ZoomInIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2 justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={cancelPhotoUpload}
                disabled={photoLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={uploadPhoto}
                disabled={photoLoading}
              >
                {photoLoading ? 'Subiendo...' : 'Confirmar y subir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de información personal */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="relative group">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              {/* Overlay para cambiar la foto - sin fondo */}
              <div 
                onClick={triggerFileInput}
                className="absolute inset-0 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="bg-white rounded-full p-2 inline-block mb-1">
                    <CameraIcon className="h-6 w-6 text-gray-800" />
                  </div>
                  <div className="bg-white rounded px-2 py-0.5">
                    <span className="text-xs text-gray-800 font-medium">Máx. 1MB</span>
                  </div>
                </div>
              </div>
              
              {/* Input oculto para seleccionar archivo */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
                disabled={photoLoading}
              />
            </div>
            
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
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
                          <CardContent className="p-4">
                            <h4 className="font-medium line-clamp-1">{cert.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{cert.instructor}</p>
                            <div className="flex justify-between items-center mt-3">
                              <Badge variant="outline" className="bg-green-50">Completado</Badge>
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
                        <Card className="overflow-hidden h-full">
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
      
      {/* Se eliminó la sección de Información Personal ya que ahora está en la página de configuración */}
    </div>
  )
}

export default withCVRequired(ProfilePage)