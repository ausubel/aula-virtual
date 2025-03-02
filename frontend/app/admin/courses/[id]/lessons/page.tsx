'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, Video, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { CoursesService } from "@/services/courses.service"
import Link from "next/link"

interface Lesson {
  id: number
  title: string
  description: string
  time: number
  videos: {
    id: number
    video_path: string
  }[]
}

interface Course {
  id: number
  name: string
  description: string
  hours: number
  teacher: {
    id: number
    name: string
  }
}

export default function CourseLessonsPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false)
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    time: 0
  })
  const [newVideo, setNewVideo] = useState({
    videoPath: ""
  })
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false)
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    loadCourseDetails()
  }, [params.id])

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true)
      const data = await CoursesService.getCourseDetails(parseInt(params.id))
      setCourse(data.course)
      setLessons(data.lessons || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del curso",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await CoursesService.createLesson({
        courseId: parseInt(params.id),
        ...newLesson
      })
      toast({
        title: "Éxito",
        description: "Lección creada correctamente"
      })
      setIsCreateLessonOpen(false)
      loadCourseDetails()
      setNewLesson({
        title: "",
        description: "",
        time: 0
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la lección",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLesson) return

    try {
      setIsLoading(true)
      await CoursesService.addVideoToLesson({
        lessonId: selectedLesson.id,
        videoPath: newVideo.videoPath
      })
      toast({
        title: "Éxito",
        description: "Video agregado correctamente"
      })
      setIsAddVideoOpen(false)
      loadCourseDetails()
      setNewVideo({
        videoPath: ""
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el video",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonToEdit) return

    try {
      setIsLoading(true)
      await CoursesService.updateLesson(lessonToEdit.id, {
        courseId: parseInt(params.id),
        title: newLesson.title,
        description: newLesson.description,
        time: newLesson.time
      })
      toast({
        title: "Éxito",
        description: "Lección actualizada correctamente"
      })
      setIsEditLessonOpen(false)
      loadCourseDetails()
      setNewLesson({ title: "", description: "", time: 0 })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la lección",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta lección?")) return

    try {
      setIsLoading(true)
      await CoursesService.deleteLesson(lessonId)
      toast({
        title: "Éxito",
        description: "Lección eliminada correctamente"
      })
      loadCourseDetails()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la lección",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este video?")) return

    try {
      setIsLoading(true)
      await CoursesService.deleteVideo(videoId)
      toast({
        title: "Éxito",
        description: "Video eliminado correctamente"
      })
      loadCourseDetails()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el video",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !course) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  if (!course) {
    return <div className="p-8 text-center">Curso no encontrado</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Lecciones: {course.name}</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lista de Lecciones</CardTitle>
              <CardDescription>
                Gestiona las lecciones y su contenido multimedia
              </CardDescription>
            </div>
            <Dialog open={isCreateLessonOpen} onOpenChange={setIsCreateLessonOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Lección
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Lección</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva lección al curso
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateLesson} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      placeholder="Ej: Introducción a HTML"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <Textarea
                      placeholder="Describe el contenido de la lección"
                      value={newLesson.description}
                      onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duración (minutos)</label>
                    <Input
                      type="number"
                      placeholder="Ej: 45"
                      value={newLesson.time}
                      onChange={(e) => setNewLesson({ ...newLesson, time: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateLessonOpen(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creando..." : "Crear Lección"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessons.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay lecciones creadas aún
                </p>
              ) : (
                lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>{lesson.title}</CardTitle>
                        <CardDescription>{lesson.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.time} minutos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog open={isAddVideoOpen && selectedLesson?.id === lesson.id} onOpenChange={(open) => {
                          setIsAddVideoOpen(open)
                          if (open) setSelectedLesson(lesson)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Agregar Video
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Agregar Video</DialogTitle>
                              <DialogDescription>
                                Ingresa la URL del video para esta lección
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddVideo} className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">URL del Video</label>
                                <Input
                                  placeholder="https://example.com/video.mp4"
                                  value={newVideo.videoPath}
                                  onChange={(e) => setNewVideo({ videoPath: e.target.value })}
                                  required
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsAddVideoOpen(false)}
                                  disabled={isLoading}
                                >
                                  Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                  {isLoading ? "Agregando..." : "Agregar Video"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setLessonToEdit(lesson)
                              setNewLesson({
                                title: lesson.title,
                                description: lesson.description,
                                time: lesson.time
                              })
                              setIsEditLessonOpen(true)
                            }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lesson.videos && lesson.videos.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Videos:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {lesson.videos.map((video) => (
                              <li key={video.id} className="text-sm flex items-center justify-between">
                                <span>{video.video_path}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteVideo(video.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No hay videos agregados
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}