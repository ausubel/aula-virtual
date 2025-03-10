'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, SearchIcon, PlusIcon, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminService } from "@/services/admin.service"

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await AdminService.getAllStudents()
      console.log("data", data)
      // Accediendo al array de estudiantes dentro de data[0]
      setStudents(data[0] || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar estudiantes según el término de búsqueda
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = student?.name?.toLowerCase()?.includes(searchLower) || false;
    const emailMatch = student?.email?.toLowerCase()?.includes(searchLower) || false;
    
    return nameMatch || emailMatch;
  });

  const getProgressWidth = (progress: number | undefined) => {
    if (typeof progress !== 'number') return '0%';
    return `${Math.min(100, Math.max(0, progress))}%`;
  };

  const handleViewProfile = (studentId: number) => {
    router.push(`/admin/students/${studentId}`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 mr-2" />
          <h1 className="text-3xl font-bold">Gestión de Estudiantes</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar estudiantes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Progreso General</th>
                    <th className="p-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.name || 'Sin nombre'}</td>
                      <td className="p-2">{student.email || 'Sin email'}</td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: getProgressWidth(student.progress) }}
                            ></div>
                          </div>
                          <span className="text-sm">{typeof student.progress === 'number' ? `${student.progress}%` : '-'}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProfile(student.id)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No se encontraron estudiantes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}