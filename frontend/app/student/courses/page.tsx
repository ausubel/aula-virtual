'use client'
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, SearchIcon, BookOpenIcon, UsersIcon, ClockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Definición del tipo de curso basado en la respuesta del backend
interface Course {
  id: number
  name: string
  description: string
  hours: number
  teacherId: number
  teacherName: string
  studentCount: number
  progress?: number // Opcional ya que vendrá del estado del estudiante
  image?: string // Opcional para mostrar una imagen del curso
}

// Datos simulados actualizados según la estructura del backend
const mockCourses: Course[] = [
  {
    id: 1,
    name: "Introducción a la Programación",
    description: "Aprende los fundamentos de la programación con JavaScript",
    hours: 32, // 8 semanas * 4 horas
    teacherId: 1,
    teacherName: "Ana Martínez",
    studentCount: 120,
    progress: 0,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kaW5nfGVufDB8fDB8fHww"
  },
  {
    id: 2,
    name: "Desarrollo Web Frontend",
    description: "Domina HTML, CSS y React para crear interfaces modernas",
    hours: 48, // 12 semanas * 4 horas
    teacherId: 2,
    teacherName: "Carlos López",
    studentCount: 85,
    progress: 45,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2ViJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 3,
    name: "Bases de Datos SQL",
    description: "Aprende a diseñar y gestionar bases de datos relacionales",
    hours: 24, // 6 semanas * 4 horas
    teacherId: 3,
    teacherName: "María García",
    studentCount: 65,
    progress: 75,
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGF0YWJhc2V8ZW58MHx8MHx8fDA%3D"
  }
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar cursos según el término de búsqueda
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis Cursos</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Explorar Cursos
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cursos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden">
              <img 
                src={course.image || '/placeholder.jpg'} 
                alt={course.name} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="line-clamp-1">{course.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    {course.teacherName}
                  </CardDescription>
                </div>
                <Badge variant="outline">{`${course.hours} horas`}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {course.description}
              </p>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>{course.hours} horas totales</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>{course.studentCount} estudiantes</span>
                </div>
                {course.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href={`/student/courses/${course.id}`}>
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  {course.progress ? "Continuar Curso" : "Comenzar Curso"}
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}