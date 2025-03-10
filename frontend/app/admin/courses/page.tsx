'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Search, Pencil, UserPlus, Video, Trash2, BookOpen, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { SweetAlert } from "@/utils/SweetAlert";

interface Course {
  id: number
  name: string
  description: string
  hours: number
  teacherId: number
  teacherName?: string
  studentCount?: number
  finished: { data: number[] }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      const data = await CoursesService.getAllCourses()
      setCourses(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => 
    (course?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (course?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleDeleteCourse = async (id: number) => {
    try {
      await CoursesService.deleteCourse(id)
      loadCourses()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso",
        variant: "destructive"
      })
    }
  }
  const handleFinishCourse = async (id: number) => {
    try {
      if (courses.find(course => course.id === id)?.finished.data[0] === 1) {
        SweetAlert.info(
          "Curso finalizado",
          "El curso ya ha sido finalizado"
        )
        return
      }
      SweetAlert.confirm(
        {
          title: "Finalizar curso",
          text: "¿Estás seguro de finalizar el curso?",
          confirmButtonText: "Finalizar",
          cancelButtonText: "Cancelar"
        }
      ).then(async (result) => {
        if (result.isConfirmed) {
          await CoursesService.finishCourseById(id)
          loadCourses()
        }
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo finalizar el curso",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Cursos</CardTitle>
            <CardDescription>Administra los cursos y sus contenidos</CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button asChild>
              <Link href="/admin/courses/create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Curso
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Descripción</th>
                    <th className="p-2 text-left">Horas</th>
                    <th className="p-2 text-left">Profesor</th>
                    <th className="p-2 text-left">Estudiantes</th>
                    <th className="p-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={`course-${course.id}`} className="border-b">
                      <td className="p-2">{course.name || 'Sin nombre'}</td>
                      <td className="p-2 max-w-xs truncate">{course.description || 'Sin descripción'}</td>
                      <td className="p-2">{course.hours || 0}</td>
                      <td className="p-2">{course.teacherName || "No asignado"}</td>
                      <td className="p-2">
                        <Badge variant="secondary">
                          {course.studentCount || 0} estudiantes
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/courses/${course.id}/lessons`)}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/courses/${course.id}/students`)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleFinishCourse(course.id)}
                            className={course.finished.data[0] === 0 ? "bg-green-100" : "bg-gray-200"}
                          >
                            <Check className={`h-4 w-4 ${course.finished.data[0] === 0 ? "text-green-600" : "text-gray-500"}`} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 