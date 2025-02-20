import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Clock, Users } from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Desarrollo Web Frontend",
    description: "Aprende HTML, CSS y JavaScript desde cero hasta un nivel avanzado",
    instructor: "Ana Martínez",
    duration: "12 horas",
    students: 234,
    progress: 45,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "React y Next.js",
    description: "Domina el desarrollo de aplicaciones modernas con React",
    instructor: "Carlos García",
    duration: "15 horas",
    students: 189,
    progress: 20,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Backend con Node.js",
    description: "Construye APIs robustas y escalables con Node.js y Express",
    instructor: "Luis Rodríguez",
    duration: "18 horas",
    students: 156,
    progress: 0,
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Cursos</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img src={course.image || "/placeholder.svg"} alt={course.title} className="object-cover w-full h-full" />
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{course.students} estudiantes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
                <Button asChild className="w-full">
                  <Link href={`/courses/${course.id}`}>
                    {course.progress === 0 ? "Comenzar Curso" : "Continuar Curso"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

