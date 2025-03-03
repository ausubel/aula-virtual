'use client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, SearchIcon, BookOpenIcon, UsersIcon, ClockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getToken } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"
import { useToast } from "@/hooks/use-toast"
import { CoursesService } from "@/services/courses.service"

// Definición del tipo de curso basado en la respuesta del backend
interface Course {
  id: number
  name: string
  description: string
  hours: number
  progress?: number
  hasCertificate?: boolean
  image?: string
}

interface DecodedToken {
  userId: number;
  userRoleId: number;
  iat?: number;
  exp?: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        if (decoded && decoded.userId) {
          loadStudentCourses(decoded.userId)
        } else {
          console.error('El token no contiene userId')
          toast({
            title: "Error",
            description: "No se pudo identificar al usuario",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        toast({
          title: "Error",
          description: "Error al verificar la identidad del usuario",
          variant: "destructive"
        })
      }
    } else {
      console.log('No se encontró el token')
      toast({
        title: "Error",
        description: "No hay sesión activa",
        variant: "destructive"
      })
    }
  }, [])

  const loadStudentCourses = async (userId: number) => {
    try {
      setIsLoading(true)
      const data = await CoursesService.getCoursesByStudentId(userId)
      setCourses(data)
    } catch (error) {
      console.error('Error al cargar los cursos:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar cursos según el término de búsqueda
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando cursos...</div>
  }

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
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron cursos
        </div>
      ) : (
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
                  {course.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                  {course.hasCertificate && (
                    <Badge variant="secondary" className="w-fit">
                      Certificado disponible
                    </Badge>
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
      )}
    </div>
  )
}