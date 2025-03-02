'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CoursesService } from "@/services/courses.service"
import { AuthService } from "@/services/auth.service"
import Link from "next/link"

interface Student {
  id: number
  name: string
  surname: string
  email: string
  isAssigned?: boolean
}

export default function CourseStudentsPage({ params }: { params: { id: string } }) {
  const [students, setStudents] = useState<Student[]>([])
  const [courseStudents, setCourseStudents] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [params.id])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      const [allStudents, courseStudentIds] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/students`, {
          headers: {
            'Authorization': `Bearer ${AuthService.getToken()}`
          }
        }).then(res => res.json()),
        CoursesService.getStudentsByCourse(parseInt(params.id))
      ])

      setStudents(allStudents.map((student: Student) => ({
        ...student,
        isAssigned: courseStudentIds.includes(student.id)
      })))
      setCourseStudents(courseStudentIds)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStudent = (studentId: number) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, isAssigned: !student.isAssigned }
        : student
    ))
  }

  const handleSaveAssignments = async () => {
    try {
      setIsLoading(true)
      const selectedStudentIds = students
        .filter(student => student.isAssigned)
        .map(student => student.id)

      await CoursesService.assignStudents({
        courseId: parseInt(params.id),
        studentIds: selectedStudentIds
      })

      toast({
        title: "Éxito",
        description: "Estudiantes asignados correctamente"
      })
      setCourseStudents(selectedStudentIds)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron asignar los estudiantes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Asignar Estudiantes al Curso</CardTitle>
            <CardDescription>
              Selecciona los estudiantes que tendrán acceso a este curso
            </CardDescription>
          </div>
          <Button onClick={handleSaveAssignments} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiantes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Seleccionar</th>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center">
                        Cargando estudiantes...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center">
                        No se encontraron estudiantes
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="p-2">
                          <Checkbox
                            checked={student.isAssigned}
                            onCheckedChange={() => handleToggleStudent(student.id)}
                          />
                        </td>
                        <td className="p-2">
                          {student.name} {student.surname}
                        </td>
                        <td className="p-2">{student.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}