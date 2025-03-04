'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

// Interface simplificada para datos del localStorage
interface StoredCourse {
  id: number
  name: string
  description: string
  hours: number
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const [courseData, setCourseData] = useState<CourseDetail | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Datos temporales para desarrollo
  const tempCourseData = {
    id: Number(params.id),
    name: "Programación Avanzada con JavaScript",
    description: "Aprende a dominar JavaScript con conceptos avanzados como promesas, async/await, programación funcional y patrones de diseño modernos.",
    hours: 40,
    teacherId: 1,
    teacherName: "Juan Pérez",
    studentCount: 35,
    progress: 25
  };

  useEffect(() => {
    // Intenta obtener datos del curso del localStorage (guardados por la página principal)
    const getStoredCourseData = () => {
      try {
        const storedCoursesJson = localStorage.getItem('studentCourses');
        if (storedCoursesJson) {
          const storedCourses = JSON.parse(storedCoursesJson);
          const currentCourse = storedCourses.find(
            (course: StoredCourse) => course.id === Number(params.id)
          );
          if (currentCourse) {
            console.log('Datos del curso encontrados en localStorage:', currentCourse);
            return currentCourse;
          }
        }
        return null;
      } catch (err) {
        console.error('Error al recuperar datos del localStorage:', err);
        return null;
      }
    };

    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Intentar cargar desde la API
        let courseDetails = null;
        try {
          courseDetails = await CoursesService.getCourseDetails(Number(params.id));
          console.log('Datos del curso obtenidos de la API:', courseDetails);
          
          // Si los datos de la API están incompletos, usar datos de respaldo
          if (!courseDetails || !courseDetails.name || !courseDetails.description) {
            console.log('Datos de API incompletos, usando datos de respaldo');
            // Usar datos temporales en desarrollo
            courseDetails = tempCourseData;
          }
        } catch (apiError) {
          console.error('Error al obtener datos del curso desde API:', apiError);
          
          // 2. Si falla la API, intentar usar localStorage como respaldo
          const storedCourse = getStoredCourseData();
          if (storedCourse) {
            courseDetails = {
              ...storedCourse,
              teacherId: 0,
              teacherName: 'Profesor',
              studentCount: 0
            };
            toast({
              title: "Información limitada",
              description: "Mostrando datos básicos del curso",
              variant: "destructive"
            });
          } else {
            // 3. Si tampoco hay datos en localStorage, usar datos temporales
            console.log('Usando datos temporales');
            courseDetails = tempCourseData;
          }
        }

        // Si tenemos datos del curso (de API o localStorage), mostrarlos
        if (courseDetails) {
          setCourseData(courseDetails);
          
          // Intentar cargar lecciones
          try {
            const courseLessons = await CoursesService.getLessonsByCourse(Number(params.id));
            setLessons(courseLessons);
            console.log('Lecciones cargadas:', courseLessons.length);
          } catch (lessonsError) {
            console.error('Error al cargar lecciones:', lessonsError);
            setLessons([]);
          }
        } else {
          throw new Error('No se pudo obtener información del curso');
        }
      } catch (err) {
        console.error('Error loading course data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el curso');
        toast({
          title: "Error",
          description: "No se pudo cargar la información del curso",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [params.id, toast]);

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
            <h1 className="text-3xl font-bold">{courseData.name || 'Curso sin nombre'}</h1>
            <p className="text-muted-foreground">{courseData.description || 'Sin descripción disponible'}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{`${courseData.hours || 0} horas`}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{courseData.teacherName || 'Profesor'}</span>
              </div>
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