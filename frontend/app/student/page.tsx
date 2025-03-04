import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Panel del Estudiante</h1>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudentDashboard
