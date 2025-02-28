import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Award, BarChart, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
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

        {/* Otros tabs similares para cursos, evaluaciones y reportes */}
      </Tabs>
    </div>
  )
}
