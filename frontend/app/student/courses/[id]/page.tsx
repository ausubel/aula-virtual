'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, FileText, PlayCircle, Download, User, AlertCircle, ChevronLeft, CheckCircle, XCircle, Circle, Check } from "lucide-react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/hooks/use-toast"
import { getToken } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Importar los componentes necesarios para el dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// Interfaces basadas en la respuesta del backend
interface Video {
  id: number
  videoPath: string
}

interface Lesson {
  id: number
  title: string
  description: string
  time: number
  videos: Video[] | string[]
  completed?: boolean // Nuevo campo para rastrear si la lección está completada
  finished?: boolean // Campo para el estado de finalización desde la API
}

interface Course {
  id: number
  name: string
  description: string
  hours: number
  progress?: number
  hasCertificate?: boolean
  image?: string
  teacherId?: number
  teacherName?: string
  finished?: boolean
}

interface DecodedToken {
  userId: number;
  userRoleId: number;
  iat?: number;
  exp?: number;
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Record<number, boolean>>({}) // Estado para rastrear lecciones completadas
  const [isUpdatingLesson, setIsUpdatingLesson] = useState<number | null>(null) // Para seguir qué lección está siendo actualizada
  const { toast } = useToast()
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        if (decoded && decoded.userId) {
          setUserId(decoded.userId)
          // Primero cargamos los datos de todos los cursos del estudiante
          loadStudentCourses(decoded.userId)
        } else {
          console.error('El token no contiene userId')
          setError('No se pudo identificar al usuario')
          toast({
            title: "Error",
            description: "No se pudo identificar al usuario",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        setError('Error al verificar la identidad del usuario')
        toast({
          title: "Error",
          description: "Error al verificar la identidad del usuario",
          variant: "destructive"
        })
      }
    } else {
      console.log('No se encontró el token')
      setError('No hay sesión activa')
      toast({
        title: "Error",
        description: "No hay sesión activa",
        variant: "destructive"
      })
    }
  }, [params.id, toast])

  const loadStudentCourses = async (userId: number) => {
    try {
      setIsLoading(true)
      
      // 1. Obtenemos todos los cursos del estudiante como en la página principal
      const allCourses = await CoursesService.getCoursesByStudentId(userId)
      console.log('Todos los cursos obtenidos:', allCourses)
      
      // 2. Filtramos para encontrar el curso actual por ID
      const currentCourseId = Number(params.id)
      const currentCourse = allCourses.find((course: Course) => course.id === currentCourseId)
      
      if (currentCourse) {
        console.log('Curso actual encontrado:', currentCourse)
        setCourseData(currentCourse)
        
        // 3. Ahora obtenemos las lecciones específicas de este curso con el ID del estudiante
        const courseLessons = await CoursesService.getLessonsByCourse(currentCourseId, userId)
        console.log('Lecciones del curso cargadas:', courseLessons.length)
        
        // Inicializamos el estado de completedLessons basado en los datos del backend
        const initialLessonsState: Record<number, boolean> = {};
        courseLessons.forEach((lesson: Lesson) => {
          initialLessonsState[lesson.id] = !!lesson.finished;
        });
        
        setCompletedLessons(initialLessonsState);
        setLessons(courseLessons)
      } else {
        console.error(`No se encontró el curso con ID ${currentCourseId}`)
        setError(`El curso con ID ${currentCourseId} no está disponible`)
        toast({
          title: "Error",
          description: "El curso solicitado no está disponible",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Error al cargar los datos del curso:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el curso')
      toast({
        title: "Error",
        description: "No se pudo cargar la información del curso",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para formatear minutos a formato "HH:mm"
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours > 0 ? `${hours}h ` : ''}${mins}min`
  }

  // Función para determinar si una lección tiene video
  const hasVideo = (lesson: Lesson): boolean => {
    return lesson.videos && 
           Array.isArray(lesson.videos) && 
           lesson.videos.length > 0 && 
           (typeof lesson.videos[0] === 'object') &&
           ('videoPath' in lesson.videos[0]) &&
           !!lesson.videos[0].videoPath;
  }

  // Función para obtener la primera URL de video de una lección (si existe)
  const getFirstVideoUrl = (lesson: Lesson): string | null => {
    if (!hasVideo(lesson)) return null;
    
    const videos = lesson.videos as Video[];
    return videos[0].videoPath;
  }

  // Función para determinar el texto del botón según si la lección tiene video
  const getLessonActionText = (lesson: Lesson): string => {
    return hasVideo(lesson) ? "Ver video" : "No hay video disponible";
  }
  
  // Función para manejar el clic en el botón de lección
  const handleLessonClick = (lesson: Lesson) => {
    // Si la lección tiene video, no hacemos nada ya que el enlace se manejará directamente
    if (!hasVideo(lesson)) {
      setSelectedLesson(lesson);
      toast({
        title: `Lección: ${lesson.title}`,
        description: "Esta lección no tiene video disponible",
        variant: "default",
      });
    }
  }
  
  // Función para marcar una lección como completada o no completada
  const toggleLessonCompletion = async (lessonId: number) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingLesson(lessonId);
      
      // El nuevo estado será lo contrario del actual
      const newStatus = !completedLessons[lessonId];
      
      // Actualizar UI primero para dar feedback inmediato
      setCompletedLessons(prev => ({
        ...prev,
        [lessonId]: newStatus
      }));
      
      // Llamar a la API para guardar el cambio en el backend
      await CoursesService.toggleLessonCompletion(lessonId, userId, newStatus);
      
      // Mostrar notificación de éxito
      toast({
        title: newStatus ? "Lección completada" : "Lección marcada como pendiente",
        description: `Has ${newStatus ? 'completado' : 'desmarcado'} esta lección`,
        variant: newStatus ? "default" : "destructive",
      });

      // Recargar los datos del curso para actualizar el progreso
      await loadStudentCourses(userId);
      
    } catch (error) {
      console.error('Error al actualizar el estado de la lección:', error);
      
      // Revertir el estado en caso de error
      setCompletedLessons(prev => ({
        ...prev,
        [lessonId]: !prev[lessonId]
      }));
      
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la lección",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLesson(null);
    }
  }

  // Función para renderizar el botón según si tiene video o no
  const renderLessonButton = (lesson: Lesson) => {
    const videoUrl = getFirstVideoUrl(lesson);
    
    if (videoUrl) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2"
          asChild
        >
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-4 w-4 mr-2" />
            Ver video
          </a>
        </Button>
      );
    } else {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2"
          onClick={() => handleLessonClick(lesson)}
          disabled
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          No hay video
        </Button>
      );
    }
  }

  // Actualizar la función para obtener todos los videos de una lección
  const getAllVideos = (lesson: Lesson): Video[] => {
    if (!lesson.videos || !Array.isArray(lesson.videos)) return [];
    return lesson.videos.filter((video): video is Video => 
      typeof video === 'object' && video !== null && 'videoPath' in video && !!video.videoPath
    );
  }

  // Función para determinar si una lección tiene videos
  const hasVideos = (lesson: Lesson): boolean => {
    const videos = getAllVideos(lesson);
    return videos.length > 0;
  }

  // Función para renderizar los botones de video con dropdown
  const renderVideoButtons = (lesson: Lesson) => {
    const videos = getAllVideos(lesson);
    
    if (videos.length === 0) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2"
          disabled
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          No hay videos
        </Button>
      );
    }

    // Si solo hay un video, mostrar un botón simple
    if (videos.length === 1) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <a href={videos[0].videoPath} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-4 w-4 mr-2" />
            Ver video
          </a>
        </Button>
      );
    }

    // Si hay múltiples videos, mostrar un dropdown
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <a href={videos[0].videoPath} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-4 w-4 mr-2" />
            Ver video 1
          </a>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Más videos
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {videos.slice(1).map((video, index) => (
              <DropdownMenuItem key={video.id || index + 1} asChild>
                <a 
                  href={video.videoPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Video {index + 2}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  if (error || !courseData) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error || 'Error al cargar el curso'}</div>
  }

  return (
    <div className="container mx-auto pl-5 pr-4 pt-1">
      <div className="space-y-4">
        {/* Botón para regresar - Ajustado el espaciado */}
        <Link 
          href="/student/courses"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver a Mis Cursos
        </Link>

        {/* Encabezado del curso */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold">{courseData.name}</h1>
            {courseData.finished && (
              <span className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Curso completado
              </span>
            )}
          </div>
        </div>

        {/* Información del curso */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">{courseData.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{`${courseData.hours} horas`}</span>
            </div>
            {courseData.teacherName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profesor: {courseData.teacherName}</span>
              </div>
            )}
            {courseData.progress !== undefined && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Progreso: {courseData.progress}%</span>
              </div>
            )}
            {courseData.hasCertificate && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Certificado disponible
              </div>
            )}
          </div>
        </div>

        {/* Pestañas de contenido */}
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lecciones del curso</CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length > 0 ? (
                  <div className="space-y-2">
                    {lessons.map((lesson) => {
                      const hasAvailableVideos = hasVideos(lesson);
                      
                      return (
                        <div key={lesson.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <div 
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border mr-2 transition-colors",
                                    completedLessons[lesson.id] 
                                      ? "border-green-500 bg-green-500 text-white" 
                                      : "border-gray-300 bg-transparent hover:border-primary/60 cursor-pointer"
                                  )}
                                  role="button"
                                  onClick={() => toggleLessonCompletion(lesson.id)}
                                  aria-busy={isUpdatingLesson === lesson.id}
                                >
                                  {isUpdatingLesson === lesson.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                                  ) : completedLessons[lesson.id] ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{lesson.title}</h3>
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatTime(lesson.time)}</span>
                                    {getAllVideos(lesson).length > 0 && (
                                      <span className="ml-2 text-xs text-blue-600 flex items-center">
                                        <PlayCircle className="h-3 w-3 mr-1" />
                                        {getAllVideos(lesson).length} {getAllVideos(lesson).length === 1 ? 'video' : 'videos'} disponibles
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              {renderVideoButtons(lesson)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay lecciones disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardContent className="space-y-4 pt-6">
                {lessons.length > 0 ? (
                  lessons.map((lesson) => {
                    const videos = getAllVideos(lesson);
                    
                    return (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div 
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                              completedLessons[lesson.id] 
                                ? "border-green-500 bg-green-500 text-white" 
                                : "border-gray-300 bg-transparent hover:border-primary/60 cursor-pointer"
                            )}
                            role="button"
                            onClick={() => toggleLessonCompletion(lesson.id)}
                            aria-busy={isUpdatingLesson === lesson.id}
                          >
                            {isUpdatingLesson === lesson.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                            ) : completedLessons[lesson.id] ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </div>
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{lesson.title}</span>
                          {videos.length > 0 && (
                            <span className="ml-1 text-xs text-blue-600 inline-flex items-center">
                              <PlayCircle className="h-3 w-3 mr-1" />
                              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatTime(lesson.time)}</span>
                          {videos.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {videos.map((video, index) => (
                                  <DropdownMenuItem key={video.id || index} asChild>
                                    <a 
                                      href={video.videoPath} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center"
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Video {index + 1}
                                    </a>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay recursos disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}