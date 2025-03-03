'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, FileText, PlayCircle, Download } from "lucide-react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/hooks/use-toast"

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

interface CourseDetail {
  id: number
  name: string
  description: string
  hours: number
  teacherId: number
  teacherName: string
  studentCount: number
  progress?: number
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const [courseData, setCourseData] = useState<CourseDetail | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true)
        // Cargar detalles del curso
        const courseDetails = await CoursesService.getCourseDetails(Number(params.id))
        setCourseData(courseDetails)

        // Cargar lecciones del curso
        const courseLessons = await CoursesService.getLessonsByCourse(Number(params.id))
        setLessons(courseLessons)
      } catch (err) {
        console.error('Error loading course data:', err)
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

    loadCourseData()
  }, [params.id, toast])

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
        <div className="lg:col-span-2 space-y-6">
          {lessons.length > 0 && (
            <div className="aspect-video bg-black rounded-lg relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white opacity-80" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{courseData.name}</h1>
            <p className="text-muted-foreground">{courseData.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{`${courseData.hours} horas`}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{courseData.teacherName}</span>
              </div>
            </div>
          </div>

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
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <Button key={lesson.id} variant="ghost" className="w-full justify-start" asChild>
                        <Link href={`/student/courses/${params.id}/lessons/${lesson.id}`}>
                          <div className="flex items-center gap-2 w-full">
                            <PlayCircle className="h-4 w-4" />
                            <span className="flex-grow text-left">{lesson.title}</span>
                            <span className="text-muted-foreground">{formatTime(lesson.time)}</span>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{lesson.title}</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Barra Lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={courseData.progress} />
                <p className="text-sm text-muted-foreground text-center">
                  {courseData.progress}% completado
                </p>
              </div>
            </CardContent>
          </Card>

          {lessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próxima Lección</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href={`/student/courses/${params.id}/lessons/${lessons[0].id}`}>
                    Continuar: {lessons[0].title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}