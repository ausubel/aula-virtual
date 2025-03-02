'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TeachersService } from "@/services/teachers.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CourseForm {
  name: string
  description: string
  hours: number
  teacherId: number
}

interface Teacher {
  id: number
  name: string
  surname: string
}

interface Props {
  params: {
    id: string
  }
}

export default function EditCoursePage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [formData, setFormData] = useState<CourseForm>({
    name: "",
    description: "",
    hours: 0,
    teacherId: 1
  })

  useEffect(() => {
    loadCourse()
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      const teachersList = await TeachersService.getAllTeachers()
      setTeachers(teachersList)
    } catch (error) {
      console.error('Error al cargar profesores:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesores",
        variant: "destructive"
      })
    }
  }

  const loadCourse = async () => {
    try {
      setIsLoading(true)
      console.log('Cargando curso con ID:', params.id)
      const course = await CoursesService.getCourseDetails(parseInt(params.id))
      console.log('Datos del curso recibidos:', course)
      
      if (!course) {
        throw new Error('No se recibieron datos del curso')
      }

      const newFormData = {
        name: course.name || '',
        description: course.description || '',
        hours: course.hours || 0,
        teacherId: course.teacherId || 1
      }
      
      console.log('Actualizando formData con:', newFormData)
      setFormData(newFormData)
    } catch (error) {
      console.error('Error al cargar el curso:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar el curso",
        variant: "destructive"
      })
      router.push('/admin/courses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await CoursesService.updateCourse(parseInt(params.id), formData)
      toast({
        title: "Éxito",
        description: "Curso actualizado correctamente"
      })
      router.push('/admin/courses')
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el curso",
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/courses">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <CardTitle>Editar Curso</CardTitle>
              <CardDescription>Modifica los detalles del curso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del Curso
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Desarrollo Web Full Stack"
                required
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
                placeholder="Describe el contenido y objetivos del curso..."
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="hours" className="text-sm font-medium">
                Duración (horas)
              </label>
              <Input
                id="hours"
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="teacherId" className="text-sm font-medium">
                Profesor
              </label>
              <Select
                value={formData.teacherId.toString()}
                onValueChange={(value) => setFormData({ ...formData, teacherId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name} {teacher.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/admin/courses">
                  Cancelar
                </Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 