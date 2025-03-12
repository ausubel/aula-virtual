'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Search, Pencil, UserPlus, Video, Trash2, BookOpen, Check, Award } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { SweetAlert } from "@/utils/SweetAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

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

interface Student {
  id: number;
  name: string;
  email: string;
  progress?: number;
  hasCertificate?: boolean | { data: number[] };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCertificateDialog, setShowCertificateDialog] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
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

  const openCertificateDialog = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId)
      setIsLoadingStudents(true)
      setSelectedStudents([])
      
      // Cargar estudiantes del curso
      const courseStudents = await CoursesService.getStudentsByCourse(courseId)
      
      console.log("Estudiantes cargados:", courseStudents)
      
      // Pre-seleccionar estudiantes que ya tienen certificado
      const certifiedStudentIds = courseStudents
        .filter(student => {
          // Manejar diferentes formatos de hasCertificate
          if (typeof student.hasCertificate === 'object' && student.hasCertificate !== null) {
            // Si es un objeto Buffer o similar con propiedad data
            return (student.hasCertificate as { data: number[] }).data && 
                   (student.hasCertificate as { data: number[] }).data[0] === 1
          }
          return !!student.hasCertificate
        })
        .map(student => student.id)
      
      console.log("Estudiantes certificados:", certifiedStudentIds)
      
      setStudents(courseStudents)
      setSelectedStudents(certifiedStudentIds)
      setShowCertificateDialog(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes del curso",
        variant: "destructive"
      })
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleAssignCertificates = async () => {
    if (!selectedCourseId || selectedStudents.length === 0) {
      toast({
        title: "Advertencia",
        description: "Debes seleccionar al menos un estudiante",
        variant: "destructive"
      })
      return
    }

    try {
      await CoursesService.assignCertificates(selectedCourseId, selectedStudents)
      
      setShowCertificateDialog(false)
      
      SweetAlert.success(
        "Certificados asignados",
        "Los certificados han sido asignados correctamente"
      )
    } catch (error) {
      SweetAlert.error(
        "Error",
        "No se pudieron asignar los certificados"
      )
    }
  }

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Cursos</CardTitle>
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
                    <tr 
                      key={`course-${course.id}`} 
                      className={`border-b ${course.finished.data[0] === 1 ? "bg-red-100" : ""}`}
                    >
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
                          
                          {course.finished.data[0] === 0 ? (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleFinishCourse(course.id)}
                              className="bg-green-100"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openCertificateDialog(course.id)}
                              className="bg-blue-100"
                            >
                              <Award className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
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

      {/* Modal para asignar certificados */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Certificados</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="mb-4 text-sm font-medium">Selecciona los estudiantes que deseas certificar</h3>
            {isLoadingStudents ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500">No hay estudiantes asignados a este curso</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {students.map((student) => {
                  // Determinar si el estudiante tiene certificado
                  const hasCertificate = typeof student.hasCertificate === 'object' && student.hasCertificate !== null
                    ? (student.hasCertificate as { data: number[] }).data && (student.hasCertificate as { data: number[] }).data[0] === 1
                    : !!student.hasCertificate;
                  
                  return (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`student-${student.id}`} 
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentSelection(student.id)}
                        disabled={hasCertificate}
                      />
                      <label 
                        htmlFor={`student-${student.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${hasCertificate ? 'text-green-600' : ''}`}
                      >
                        {student.name} ({student.email})
                        {hasCertificate && (
                          <span className="ml-2 text-xs text-green-600 font-semibold">(Certificado)</span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCertificateDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignCertificates}
              disabled={selectedStudents.length === 0 || isLoadingStudents}
            >
              Asignar Seleccionados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}