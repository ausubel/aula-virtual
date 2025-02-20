import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, GraduationCap, Calendar, Trophy, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const courses = [
  {
    id: 1,
    title: "Desarrollo Web Frontend",
    description: "Aprende HTML, CSS y JavaScript desde cero hasta un nivel avanzado",
    instructor: "Ana Martínez",
    duration: "12 horas",
    students: 234,
    progress: 45,
    rating: 4.8,
    nextLesson: "Introducción a CSS Grid",
    nextDate: "Hoy, 15:00",
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
    rating: 4.9,
    nextLesson: "Componentes en React",
    nextDate: "Mañana, 10:00",
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
    rating: 4.7,
    nextLesson: "Introducción a Node.js",
    nextDate: "Próximo Lunes, 14:00",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const stats = [
  {
    title: "Cursos en Progreso",
    value: "3",
    description: "+2 esta semana",
    icon: BookOpen,
  },
  {
    title: "Horas de Estudio",
    value: "24.5",
    description: "+5.5 esta semana",
    icon: Clock,
  },
  {
    title: "Certificados",
    value: "2",
    description: "+1 este mes",
    icon: GraduationCap,
  },
  {
    title: "Posición Ranking",
    value: "#12",
    description: "Top 5%",
    icon: Trophy,
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bienvenido de vuelta, Juan</h1>
          <p className="text-muted-foreground">Continúa tu aprendizaje donde lo dejaste</p>
        </div>
        <Button size="lg" className="w-full md:w-auto">
          <BookOpen className="mr-2 h-4 w-4" />
          Explorar Nuevos Cursos
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="in-progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="in-progress">En Progreso</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="saved">Guardados</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <div className="aspect-video relative rounded-t-lg overflow-hidden">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 stroke-yellow-400" />
                    {course.rating}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.students} estudiantes</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  {course.progress > 0 && (
                    <div className="bg-muted p-3 rounded-lg space-y-1">
                      <div className="text-sm font-medium">Próxima Lección:</div>
                      <div className="text-sm text-muted-foreground">{course.nextLesson}</div>
                      <div className="text-xs flex items-center text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {course.nextDate}
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>
                      {course.progress === 0 ? "Comenzar Curso" : "Continuar Curso"}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

