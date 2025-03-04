'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, FileText, PlayCircle, Download } from "lucide-react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/hooks/use-toast"
import { getToken } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"

// Interfaces basadas en la respuesta del backend
interface Lesson {
  id: number
  title: string
  description: string
  time: number
  videos: Array<{
    id: number
    videoPath: string
  }> | string[]
}

interface Course {
  id: number
  name: string
  description: string
  hours: number
  progress?: number
  hasCertificate?: boolean
  image?: string
  teacherName?: string
}

interface DecodedToken {
  userId: number;
  userRoleId: number;
  iat?: number;
  exp?: number;
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  if (error || !courseData) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error || 'Error al cargar el curso'}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Banner o imagen de curso */}
          <div className="aspect-video bg-black rounded-lg relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white opacity-80" />
            </div>
          </div>

          {/* Información del curso */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{courseData.name}</h1>
            <p className="text-muted-foreground">{courseData.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{`${courseData.hours} horas`}</span>
              </div>
              {courseData.teacherName && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{courseData.teacherName}</span>
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
                      {lessons.map((lesson) => (
                        <Button key={lesson.id} variant="ghost" className="w-full justify-start">
                          <div className="flex items-center gap-2 w-full">
                            <PlayCircle className="h-4 w-4" />
                            <span className="flex-grow text-left">{lesson.title}</span>
                            <span className="text-muted-foreground">{formatTime(lesson.time)}</span>
                          </div>
                        </Button>
                      ))}
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
                    lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{lesson.title}</span>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
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
    </div>
  )
}