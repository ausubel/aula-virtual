'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, DownloadCloud, List, PlayCircle } from "lucide-react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/hooks/use-toast"

// Interfaces para los datos
interface Lesson {
  id: number
  title: string
  description: string
  time: number
  videos: Video[]
}

interface Video {
  id: number
  videoPath: string
}

interface Resource {
  id: number
  name: string
  type: string
  url: string
}

export default function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Recursos simulados - estos normalmente vendrían del backend
  const resources: Resource[] = [
    {
      id: 1,
      name: `Presentación de la lección ${params.lessonId}`,
      type: "pdf",
      url: "/presentations/lesson1.pdf",
    },
    {
      id: 2,
      name: "Código de ejemplo",
      type: "zip",
      url: "/code/lesson1.zip",
    },
  ]

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setIsLoading(true)
        
        // Cargar todas las lecciones del curso
        const courseLessons = await CoursesService.getLessonsByCourse(Number(params.id))
        setAllLessons(courseLessons)
        
        // Encontrar la lección actual
        const lessonId = Number(params.lessonId)
        const currentLesson = courseLessons.find(l => l.id === lessonId)
        const currentIndex = courseLessons.findIndex(l => l.id === lessonId)
        
        if (currentLesson) {
          setLesson(currentLesson)
          setCurrentLessonIndex(currentIndex)
        } else {
          toast({
            title: "Error",
            description: "No se encontró la lección",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error al cargar la lección:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la lección",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadLessonData()
  }, [params.id, params.lessonId, toast])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  if (!lesson) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">No se encontró la lección</div>
  }

  // Calcular lecciones anterior y siguiente
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null

  // Determinar URL de video (primera video si hay varios)
  const videoUrl = lesson.videos && lesson.videos.length > 0 ? lesson.videos[0].videoPath : null

  return (
    <div className="container mx-auto p-6">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-[calc(100vh-8rem)] overflow-y-auto">
          <CardContent className="p-4">
            <Button variant="outline" className="w-full mb-4" asChild>
              <Link href={`/student/courses/${params.id}`}>
                <List className="mr-2 h-4 w-4" />
                Contenido del curso
              </Link>
            </Button>

            <div className="space-y-2">
              <h3 className="font-semibold mb-4">Módulo 1: Introducción</h3>
              {allLessons.map((lessonItem) => (
                <Button 
                  key={lessonItem.id}
                  variant={lessonItem.id === lesson.id ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  asChild
                >
                  <Link href={`/student/courses/${params.id}/lessons/${lessonItem.id}`}>
                    {lessonItem.title}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {videoUrl ? (
            <div className="aspect-video bg-black rounded-lg relative">
              {/* Aquí iría el componente de reproductor de video con la URL */}
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white opacity-80" />
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-white">
              No hay video disponible para esta lección
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <div className="flex gap-2">
                {prevLesson && (
                  <Button variant="outline" asChild>
                    <Link href={`/student/courses/${params.id}/lessons/${prevLesson.id}`}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Link>
                  </Button>
                )}
                {nextLesson && (
                  <Button asChild>
                    <Link href={`/student/courses/${params.id}/lessons/${nextLesson.id}`}>
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <p className="text-muted-foreground">{lesson.description}</p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recursos de la lección</h2>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <span>{resource.name}</span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={resource.url} download>
                        <DownloadCloud className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}