'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Award, BarChart, LogOut, Plus, Search, Pencil, UserPlus, Video } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { CoursesService } from "@/services/courses.service"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Course {
  id: number
  name: string
  description: string
  hours: number
  teacherId: number
  teacherName?: string
  studentCount?: number
}

export default function AdminDashboard() {
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    hours: 0,
    teacherId: 1 // Valor por defecto, deberías obtener el ID del profesor actual
  })
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)
  
  const { toast } = useToast()

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await CoursesService.createCourse(newCourse)
      toast({
        title: "Éxito",
        description: "Curso creado correctamente"
      })
      setIsCreateCourseOpen(false)
      loadCourses()
      setNewCourse({
        name: "",
        description: "",
        hours: 0,
        teacherId: 1
      })
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

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseToEdit) return

    try {
      setIsLoading(true)
      await CoursesService.updateCourse(courseToEdit.id, newCourse)
      toast({
        title: "Éxito",
        description: "Curso actualizado correctamente"
      })
      setIsEditCourseOpen(false)
      loadCourses()
      setNewCourse({
        name: "",
        description: "",
        hours: 0,
        teacherId: 1
      })
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

  const handleManageStudents = (courseId: number) => {
    // Redirigir a la página de gestión de estudiantes
    window.location.href = `/admin/courses/${courseId}/students`
  }

  const handleManageLessons = (courseId: number) => {
    // Redirigir a la página de gestión de lecciones
    window.location.href = `/admin/courses/${courseId}/lessons`
  }

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button variant="destructive" asChild>
          <Link href="/cookie-logout" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Link>
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-2">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-2">3 nuevos esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground mt-2">+48 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-2">+5% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabla de usuarios */}
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Nombre</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Progreso</th>
                      <th className="p-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Juan Pérez</td>
                      <td className="p-2">juan@example.com</td>
                      <td className="p-2">75%</td>
                      <td className="p-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          Activo
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">María García</td>
                      <td className="p-2">maria@example.com</td>
                      <td className="p-2">45%</td>
                      <td className="p-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          Activo
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Cursos</CardTitle>
                <CardDescription>Administra los cursos y sus contenidos</CardDescription>
              </div>
              <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Curso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Curso</DialogTitle>
                    <DialogDescription>
                      Ingresa la información básica del curso. Podrás agregar lecciones después.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre del Curso</label>
                      <Input 
                        placeholder="Ej: Desarrollo Web Frontend"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <Textarea 
                        placeholder="Breve descripción del curso"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duración (horas)</label>
                      <Input 
                        type="number"
                        placeholder="Ej: 40"
                        value={newCourse.hours}
                        onChange={(e) => setNewCourse({ ...newCourse, hours: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateCourseOpen(false)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creando..." : "Crear Curso"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cursos..."
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
                        <th className="p-2 text-left">Nombre del Curso</th>
                        <th className="p-2 text-left">Instructor</th>
                        <th className="p-2 text-left">Estudiantes</th>
                        <th className="p-2 text-left">Estado</th>
                        <th className="p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">
                            Cargando cursos...
                          </td>
                        </tr>
                      ) : filteredCourses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">
                            No se encontraron cursos
                          </td>
                        </tr>
                      ) : (
                        filteredCourses.map((course) => (
                          <tr key={course.id} className="border-b">
                            <td className="p-2">{course.name}</td>
                            <td className="p-2">{course.teacherName || "Sin asignar"}</td>
                            <td className="p-2">{course.studentCount || 0}</td>
                            <td className="p-2">
                              <Badge variant="secondary">Activo</Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setCourseToEdit(course)
                                    setNewCourse({
                                      name: course.name,
                                      description: course.description,
                                      hours: course.hours,
                                      teacherId: course.teacherId
                                    })
                                    setIsEditCourseOpen(true)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleManageStudents(course.id)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleManageLessons(course.id)}
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de evaluaciones pendiente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de reportes pendiente...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        {/* ...existing dialog content... */}
      </Dialog>
    </div>
  )
}
