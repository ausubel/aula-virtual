import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpenIcon, AwardIcon } from "lucide-react"

function StudentDashboard() {
  const courses = [
    {
      id: 1,
      name: "Matemáticas Avanzadas",
      progress: 75,
      instructor: "Prof. García",
    },
    {
      id: 2,
      name: "Programación Web",
      progress: 45,
      instructor: "Prof. Martínez",
    },
    {
      id: 3,
      name: "Inglés Técnico",
      progress: 90,
      instructor: "Prof. Smith",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bienvenido a tu Dashboard</h1>
        <p className="text-muted-foreground">Accede rápidamente a tus cursos y certificados</p>
      </div>
      
      {/* Sección de navegación rápida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <Link href="/student/courses" className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpenIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Mis Cursos</h3>
                <p className="text-sm text-muted-foreground">Accede a todos tus cursos</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <Link href="/student/certificates" className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <AwardIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Mis Certificados</h3>
                <p className="text-sm text-muted-foreground">Ver y descargar certificados</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Cursos Recientes</h2>
          <Button asChild variant="outline">
            <Link href="/student/courses">Ver todos</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>Instructor: {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Progreso del curso</span>
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                  <div className="pt-2">
                    <Button asChild size="sm">
                      <Link href={`/student/courses/${course.id}`}>
                        Continuar curso
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
