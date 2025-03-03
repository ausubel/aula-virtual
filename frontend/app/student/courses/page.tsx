'use client'
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, SearchIcon, BookOpenIcon, UsersIcon, ClockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Datos simulados de cursos
const mockCourses = [
  {
    id: 1,
    title: "Introducción a la Programación",
    description: "Aprende los fundamentos de la programación con JavaScript",
    instructor: "Ana Martínez",
    category: "Programación",
    level: "Principiante",
    duration: "8 semanas",
    students: 120,
    progress: 0,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kaW5nfGVufDB8fDB8fHww"
  },
  {
    id: 2,
    title: "Desarrollo Web Frontend",
    description: "Domina HTML, CSS y React para crear interfaces modernas",
    instructor: "Carlos López",
    category: "Desarrollo Web",
    level: "Intermedio",
    duration: "12 semanas",
    students: 85,
    progress: 45,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2ViJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 3,
    title: "Bases de Datos SQL",
    description: "Aprende a diseñar y gestionar bases de datos relacionales",
    instructor: "María García",
    category: "Bases de Datos",
    level: "Intermedio",
    duration: "6 semanas",
    students: 65,
    progress: 75,
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGF0YWJhc2V8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 4,
    title: "Desarrollo de Aplicaciones Móviles",
    description: "Crea aplicaciones para iOS y Android con React Native",
    instructor: "Pedro Rodríguez",
    category: "Desarrollo Móvil",
    level: "Avanzado",
    duration: "10 semanas",
    students: 50,
    progress: 20,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9iaWxlJTIwYXBwfGVufDB8fDB8fHww"
  }
]

export default function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar cursos según el término de búsqueda
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
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
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    {course.instructor}
                  </CardDescription>
                </div>
                <Badge variant="outline">{course.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {course.description}
              </p>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>{course.students} estudiantes</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                {course.progress > 0 ? "Continuar Curso" : "Comenzar Curso"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}