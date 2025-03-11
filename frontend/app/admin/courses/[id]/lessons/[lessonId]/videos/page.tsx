'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { CoursesService } from "@/services/courses.service"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
  params: {
    id: string
    lessonId: string
  }
}

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

export default function LessonVideosPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [videoPath, setVideoPath] = useState("")

  useEffect(() => {
    loadLesson()
  }, [])

  const loadLesson = async () => {
    try {
      setIsLoading(true)
      const lessons = await CoursesService.getLessonsByCourse(parseInt(params.id))
      console.log('Lecciones cargadas:', lessons)
      const currentLesson = lessons.find(l => l.id === parseInt(params.lessonId))
      console.log('Lección actual:', currentLesson)
      
      if (currentLesson) {
        console.log('Videos de la lección:', currentLesson.videos)
        setLesson(currentLesson)
      } else {
        throw new Error('Lección no encontrada')
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

  const handleAddVideo = async () => {
    if (!videoPath.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de video válida",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      console.log('Intentando agregar video:', {
        lessonId: parseInt(params.lessonId),
        videoPath
      })
      
      const result = await CoursesService.addVideoToLesson(
        parseInt(params.lessonId),
        { videoPath }
      )
      
      console.log('Respuesta al agregar video:', result)
      
      toast({
        title: "Éxito",
        description: "Video agregado correctamente"
      })
      setIsDialogOpen(false)
      setVideoPath("")
      loadLesson()
    } catch (error) {
      console.error('Error al agregar video:', error)
      toast({
        title: "Error",
        description: "No se pudo agregar el video",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este video?')) return

    try {
      setIsLoading(true)
      console.log('Intentando eliminar video:', videoId)
      
      const result = await CoursesService.deleteVideo(videoId)
      console.log('Resultado de eliminar video:', result)
      
      toast({
        title: "Éxito",
        description: "Video eliminado correctamente"
      })
      loadLesson()
    } catch (error) {
      console.error('Error al eliminar video:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el video",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/courses/${params.id}/lessons`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle className="mb-5">Videos de la Lección</CardTitle>
                <CardDescription>
                  {lesson?.title || 'Cargando...'}
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Video
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Video</DialogTitle>
                  <DialogDescription>
                    Ingresa la URL del video que deseas agregar a esta lección
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="videoPath" className="text-sm font-medium">
                      URL del Video
                    </label>
                    <Input
                      id="videoPath"
                      value={videoPath}
                      onChange={(e) => setVideoPath(e.target.value)}
                      placeholder="https://ejemplo.com/video.mp4"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddVideo} disabled={isLoading}>
                    {isLoading ? "Agregando..." : "Agregar Video"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : lesson?.videos && lesson.videos.length > 0 ? (
            <div className="space-y-4">
              {lesson.videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Video</div>
                    <div className="text-sm text-muted-foreground break-all">
                      {video.videoPath}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No hay videos agregados a esta lección
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 