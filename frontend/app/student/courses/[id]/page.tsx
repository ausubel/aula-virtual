import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, FileText, PlayCircle, Download, CheckCircle } from "lucide-react"

// Simula datos del curso
const courseData = {
  id: 1,
  title: "Desarrollo Web Frontend",
  description: "Aprende HTML, CSS y JavaScript desde cero hasta un nivel avanzado",
  instructor: "Ana Martínez",
  duration: "12 horas",
  progress: 45,
  modules: [
    {
      id: 1,
      title: "Introducción al Desarrollo Web",
      completed: true,
      lessons: [
        {
          id: 1,
          title: "¿Qué es el desarrollo web?",
          duration: "10:30",
          type: "video",
          completed: true,
          url: "https://example.com/video1.mp4",
        },
        {
          id: 2,
          title: "Herramientas necesarias",
          duration: "15:45",
          type: "video",
          completed: true,
          url: "https://example.com/video2.mp4",
        },
        {
          id: 3,
          title: "Guía de inicio rápido",
          type: "document",
          completed: true,
          url: "https://example.com/guide.pdf",
        },
      ],
    },
    {
      id: 2,
      title: "HTML Fundamentals",
      completed: false,
      lessons: [
        {
          id: 4,
          title: "Estructura básica HTML",
          duration: "20:15",
          type: "video",
          completed: false,
          url: "https://example.com/video3.mp4",
        },
        {
          id: 5,
          title: "Elementos HTML comunes",
          duration: "18:30",
          type: "video",
          completed: false,
          url: "https://example.com/video4.mp4",
        },
        {
          id: 6,
          title: "Ejercicios prácticos",
          type: "document",
          completed: false,
          url: "https://example.com/exercises.pdf",
        },
      ],
    },
  ],
}

export default function CoursePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-lg relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white opacity-80" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{courseData.title}</h1>
            <p className="text-muted-foreground">{courseData.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{courseData.instructor}</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {courseData.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {module.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <Button key={lesson.id} variant="ghost" className="w-full justify-start" asChild>
                          <Link href={`/student/courses/${params.id}/lessons/${lesson.id}`}>
                            <div className="flex items-center gap-2">
                              {lesson.type === "video" ? (
                                <PlayCircle className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span>{lesson.title}</span>
                              {lesson.duration && (
                                <span className="ml-auto text-muted-foreground">{lesson.duration}</span>
                              )}
                              {lesson.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Guía de inicio rápido</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Ejercicios prácticos</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
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
                <p className="text-sm text-muted-foreground text-center">{courseData.progress}% completado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próxima Lección</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href={`/student/courses/${params.id}/lessons/4`}>Continuar: Estructura básica HTML</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}