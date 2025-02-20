import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  BookOpen,
  Award,
  BarChart,
  Search,
  UserPlus,
  GraduationCap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
} from "lucide-react"

const stats = [
  {
    title: "Total Estudiantes",
    value: "1,234",
    change: "+12%",
    trend: "up",
    description: "vs. mes pasado",
    icon: Users,
  },
  {
    title: "Cursos Activos",
    value: "15",
    change: "+3",
    trend: "up",
    description: "esta semana",
    icon: BookOpen,
  },
  {
    title: "Certificados Emitidos",
    value: "892",
    change: "+48",
    trend: "up",
    description: "esta semana",
    icon: Award,
  },
  {
    title: "Tasa de Finalización",
    value: "78%",
    change: "-2%",
    trend: "down",
    description: "vs. mes pasado",
    icon: BarChart,
  },
]

const recentUsers = [
  {
    name: "Juan Pérez",
    email: "juan@example.com",
    progress: 75,
    courses: 3,
    lastActive: "Hace 2 horas",
    status: "active",
  },
  {
    name: "María García",
    email: "maria@example.com",
    progress: 45,
    courses: 2,
    lastActive: "Hace 5 horas",
    status: "active",
  },
  {
    name: "Carlos López",
    email: "carlos@example.com",
    progress: 90,
    courses: 4,
    lastActive: "Hace 1 hora",
    status: "active",
  },
  {
    name: "Ana Martínez",
    email: "ana@example.com",
    progress: 60,
    courses: 2,
    lastActive: "Hace 3 horas",
    status: "active",
  },
]

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona tu plataforma educativa</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="p-2 bg-primary/5 rounded-full">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs flex items-center ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad Reciente</CardTitle>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Últimas actividades de los usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium">Nueva Certificación</p>
                  <p className="text-xs text-muted-foreground">Juan Pérez completó "Desarrollo Web Frontend"</p>
                </div>
                <p className="ml-auto text-xs text-muted-foreground">Hace 2h</p>
              </div>
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-green-600 p-1.5 bg-green-50 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium">Nuevo Usuario</p>
                  <p className="text-xs text-muted-foreground">María García se unió a la plataforma</p>
                </div>
                <p className="ml-auto text-xs text-muted-foreground">Hace 4h</p>
              </div>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600 p-1.5 bg-blue-50 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium">Curso Actualizado</p>
                  <p className="text-xs text-muted-foreground">Se añadió nuevo contenido a "React y Next.js"</p>
                </div>
                <p className="ml-auto text-xs text-muted-foreground">Hace 6h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rendimiento de Cursos</CardTitle>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Estadísticas de los cursos más populares</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Desarrollo Web Frontend</p>
                  <span className="text-sm text-muted-foreground">234 estudiantes</span>
                </div>
                <Progress value={85} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tasa de finalización: 85%</span>
                  <span className="text-green-600">↑ 12%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">React y Next.js</p>
                  <span className="text-sm text-muted-foreground">189 estudiantes</span>
                </div>
                <Progress value={72} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tasa de finalización: 72%</span>
                  <span className="text-green-600">↑ 8%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Backend con Node.js</p>
                  <span className="text-sm text-muted-foreground">156 estudiantes</span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tasa de finalización: 65%</span>
                  <span className="text-red-600">↓ 3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Lista de usuarios registrados en la plataforma</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar usuarios..." className="pl-8 w-[250px]" />
              </div>
              <Button variant="outline">Exportar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left text-sm">Usuario</th>
                  <th className="p-3 text-left text-sm">Cursos</th>
                  <th className="p-3 text-left text-sm">Progreso</th>
                  <th className="p-3 text-left text-sm">Última Actividad</th>
                  <th className="p-3 text-left text-sm">Estado</th>
                  <th className="p-3 text-left text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{user.courses}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{user.progress}%</span>
                        </div>
                        <Progress value={user.progress} className="h-2" />
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{user.lastActive}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                        Activo
                      </span>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

