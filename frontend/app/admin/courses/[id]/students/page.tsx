'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Search, UserPlus, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

// Definir la interfaz Student aquí para evitar conflictos con otras definiciones
interface Student {
  id: number
  name: string
  email: string
  progress: number
}

interface Props {
  params: {
    id: string
  }
}

export default function CourseStudentsPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [loadingAvailableStudents, setLoadingAvailableStudents] = useState(false)
  const [removingStudentId, setRemovingStudentId] = useState<number | null>(null)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    if (isAddStudentsOpen) {
      loadAvailableStudents()
    }
  }, [isAddStudentsOpen])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      const data = await CoursesService.getStudentsByCourse(parseInt(params.id))
      
      // Asegurarse de que los datos tienen el formato correcto
      const formattedData = data.map((student: any) => ({
        id: student.id,
        name: student.name || 'Sin nombre',
        email: student.email || 'Sin email',
        progress: typeof student.progress === 'number' ? student.progress : 0
      }))
      
      setStudents(formattedData)
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableStudents = async () => {
    try {
      setLoadingAvailableStudents(true)
      // Obtener todos los estudiantes
      const allStudents = await CoursesService.getAllStudents()
      
      // Asegurarse de que los datos tienen el formato correcto
      const formattedAllStudents = allStudents.map((student: any) => ({
        id: student.id,
        name: student.name || 'Sin nombre',
        email: student.email || 'Sin email',
        progress: typeof student.progress === 'number' ? student.progress : 0
      }))
      
      // Filtrar los estudiantes que ya están en el curso
      const currentStudentIds = students.map(s => s.id)
      
      const available = formattedAllStudents.filter(s => !currentStudentIds.includes(s.id))
      
      setAvailableStudents(available)
      setSelectedStudents([])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes disponibles",
        variant: "destructive"
      })
    } finally {
      setLoadingAvailableStudents(false)
    }
  }

  const handleAddStudents = async () => {
    try {
      if (selectedStudents.length === 0) {
        toast({
          title: "Advertencia",
          description: "No has seleccionado ningún estudiante",
          variant: "destructive"
        })
        return
      }
      
      setIsLoading(true)
      
      await CoursesService.assignStudents({
        courseId: parseInt(params.id),
        studentIds: selectedStudents
      })
      
      toast({
        title: "Éxito",
        description: "Estudiantes agregados correctamente"
      })
      
      setIsAddStudentsOpen(false)
      loadStudents() // Recargar la lista de estudiantes
    } catch (error) {
      console.error('Error al agregar estudiantes:', error)
      toast({
        title: "Error",
        description: "No se pudieron agregar los estudiantes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    try {
      setRemovingStudentId(studentId)
      
      await CoursesService.removeStudentFromCourse(parseInt(params.id), studentId)
      
      toast({
        title: "Éxito",
        description: "Estudiante eliminado correctamente"
      })
      
      // Actualizar la lista de estudiantes
      setStudents(prev => prev.filter(s => s.id !== studentId))
    } catch (error) {
      console.error('Error al eliminar estudiante:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudiante",
        variant: "destructive"
      })
    } finally {
      setRemovingStudentId(null)
    }
  }

  const filteredStudents = students.filter(student => 
    (student?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

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
              <CardTitle>Estudiantes del Curso</CardTitle>
              <CardDescription>Gestiona los estudiantes inscritos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={isAddStudentsOpen} onOpenChange={setIsAddStudentsOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Agregar Estudiantes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Estudiantes</DialogTitle>
                  <DialogDescription>
                    Selecciona los estudiantes que deseas agregar al curso
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {loadingAvailableStudents ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay estudiantes disponibles para agregar
                    </div>
                  ) : (
                    availableStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => {
                            setSelectedStudents(prev =>
                              checked
                                ? [...prev, student.id]
                                : prev.filter(id => id !== student.id)
                            )
                          }}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {student.name} ({student.email})
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setIsAddStudentsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddStudents} disabled={isLoading || selectedStudents.length === 0}>
                    {isLoading ? "Agregando..." : "Agregar Seleccionados"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay estudiantes inscritos en este curso
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Progreso</th>
                    <th className="p-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.name}</td>
                      <td className="p-2">{student.email}</td>
                      <td className="p-2">
                        <Badge variant="secondary">
                          {student.progress}%
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRemoveStudent(student.id)}
                          disabled={removingStudentId === student.id}
                        >
                          {removingStudentId === student.id ? (
                            <div className="animate-spin h-4 w-4 border-b-2 border-red-500 rounded-full"></div>
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
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