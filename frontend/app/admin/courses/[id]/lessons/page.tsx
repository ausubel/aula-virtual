'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CoursesService } from "@/services/courses.service"
import { ArrowLeft, Plus, Pencil, Trash2, Video } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

interface Props {
  params: {
    id: string
  }
}

interface LessonForm {
  title: string
  description: string
  time: number
}

export default function CourseLessonsPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState<LessonForm>({
    title: "",
    description: "",
    time: 0
  })

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setIsLoading(true)
      const lessonsData = await CoursesService.getLessonsByCourse(parseInt(params.id))
      setLessons(lessonsData)
    } catch (error) {
      console.error('Error al cargar lecciones:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las lecciones",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLesson = async () => {
    try {
      setIsLoading(true)
      await CoursesService.createLesson({
        courseId: parseInt(params.id),
        ...formData
      })
      toast({
        title: "Éxito",
        description: "Lección creada correctamente"
      })
      setIsDialogOpen(false)
      resetForm()
      loadLessons()
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

  const handleEditLesson = async () => {
    if (!selectedLesson) return

    try {
      setIsLoading(true)
      await CoursesService.updateLesson(selectedLesson.id, formData)
      toast({
        title: "Éxito",
        description: "Lección actualizada correctamente"
      })
      setIsDialogOpen(false)
      resetForm()
      loadLessons()
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
    if (!confirm('¿Estás seguro de que deseas eliminar esta lección?')) return

    try {
      setIsLoading(true)
      await CoursesService.deleteLesson(lessonId)
      toast({
        title: "Éxito",
        description: "Lección eliminada correctamente"
      })
      loadLessons()
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

  const openCreateDialog = () => {
    setSelectedLesson(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description,
      time: lesson.time
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      time: 0
    })
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/courses">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle>Lecciones del Curso</CardTitle>
                <CardDescription>Gestiona las lecciones del curso</CardDescription>
              </div>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Lección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Duración (min)</TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>{lesson.description}</TableCell>
                    <TableCell>{lesson.time}</TableCell>
                    <TableCell>{lesson.videos?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/courses/${params.id}/lessons/${lesson.id}/videos`)}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(lesson)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {lessons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay lecciones creadas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Editar Lección" : "Nueva Lección"}
            </DialogTitle>
            <DialogDescription>
              {selectedLesson
                ? "Modifica los detalles de la lección"
                : "Ingresa los detalles de la nueva lección"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Introducción a React"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el contenido de la lección..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Duración (minutos)
              </label>
              <Input
                id="time"
                type="number"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={selectedLesson ? handleEditLesson : handleCreateLesson}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : selectedLesson ? "Guardar Cambios" : "Crear Lección"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}