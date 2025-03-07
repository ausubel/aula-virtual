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
  const { toast } = useToast()

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        if (decoded && decoded.userId) {
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
        
        // 3. Ahora obtenemos las lecciones específicas de este curso
        const courseLessons = await CoursesService.getLessonsByCourse(currentCourseId)
        console.log('Lecciones del curso cargadas:', courseLessons.length)
        
        // Por ahora, inicializamos todas las lecciones como no completadas
        // En el futuro, esto vendrá del backend
        const initialLessonsState: Record<number, boolean> = {};
        courseLessons.forEach((lesson: Lesson) => {
          initialLessonsState[lesson.id] = false; // O recuperar del backend
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
  const toggleLessonCompletion = (lessonId: number, isVideoAvailable: boolean) => {
    // Si no hay video disponible, no permitimos marcar como completada
    if (!isVideoAvailable) {
      toast({
        title: "Video no disponible",
        description: "No puedes marcar como completada una lección sin video",
        variant: "destructive",
      });
      return;
    }
    
    setCompletedLessons(prev => {
      const newState = { ...prev };
      newState[lessonId] = !prev[lessonId];
      
      // Aquí eventualmente se enviará una actualización al backend
      console.log(`Lección ${lessonId} marcada como ${newState[lessonId] ? 'completada' : 'pendiente'}`);
      
      // Mostrar notificación
      toast({
        title: newState[lessonId] ? "Lección completada" : "Lección marcada como pendiente",
        description: `Has ${newState[lessonId] ? 'completado' : 'desmarcado'} esta lección`,
        variant: newState[lessonId] ? "default" : "destructive",
      });
      
      return newState;
    });
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
          href="/student/certificates"
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
                      const isVideoAvailable = hasVideo(lesson);
                      
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
                                      : isVideoAvailable
                                        ? "border-gray-300 bg-transparent hover:border-primary/60 cursor-pointer"
                                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  )}
                                  role="button"
                                  onClick={() => toggleLessonCompletion(lesson.id, isVideoAvailable)}
                                >
                                  {completedLessons[lesson.id] ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Circle className={cn("h-4 w-4", isVideoAvailable ? "" : "text-gray-400")} />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{lesson.title}</h3>
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatTime(lesson.time)}</span>
                                    {!isVideoAvailable && (
                                      <span className="ml-2 text-xs text-amber-600 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Sin video disponible
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              {renderLessonButton(lesson)}
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
                    const isVideoAvailable = hasVideo(lesson);
                    
                    return (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div 
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                              completedLessons[lesson.id] 
                                ? "border-green-500 bg-green-500 text-white" 
                                : isVideoAvailable
                                  ? "border-gray-300 bg-transparent hover:border-primary/60 cursor-pointer"
                                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                            role={isVideoAvailable ? "button" : "presentation"}
                            onClick={() => isVideoAvailable && toggleLessonCompletion(lesson.id, isVideoAvailable)}
                          >
                            {completedLessons[lesson.id] ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Circle className={cn("h-3 w-3", isVideoAvailable ? "" : "text-gray-400")} />
                            )}
                          </div>
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{lesson.title}</span>
                          {!isVideoAvailable && (
                            <span className="ml-1 text-xs text-amber-600 inline-flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Sin video
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatTime(lesson.time)}</span>
                          {isVideoAvailable ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <a href={getFirstVideoUrl(lesson)!} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              disabled
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
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