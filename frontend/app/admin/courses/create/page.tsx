'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CoursesService } from "@/services/courses.service"
import { TeachersService } from "@/services/teachers.service"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
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

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [formData, setFormData] = useState<CourseForm>({
    name: "",
    description: "",
    hours: 0,
    teacherId: 0
  })

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      const teachersList = await TeachersService.getAllTeachers()
      setTeachers(teachersList)
      if (teachersList.length > 0) {
        setFormData(prev => ({ ...prev, teacherId: teachersList[0].id }))
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesores",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await CoursesService.createCourse(formData)
      toast({
        title: "Éxito",
        description: "Curso creado correctamente"
      })
      router.push('/admin/courses')
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el curso",
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
              <CardTitle>Crear Nuevo Curso</CardTitle>
              <CardDescription>Ingresa los detalles del nuevo curso</CardDescription>
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
                {isLoading ? "Creando..." : "Crear Curso"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 