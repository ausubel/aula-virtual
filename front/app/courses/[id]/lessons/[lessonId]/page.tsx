import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, DownloadCloud, List } from "lucide-react"

// Simula datos de la lección
const lessonData = {
  id: 1,
  title: "¿Qué es el desarrollo web?",
  videoUrl: "https://example.com/video1.mp4",
  description:
    "En esta lección aprenderemos los conceptos básicos del desarrollo web y su importancia en el mundo actual.",
  resources: [
    {
      id: 1,
      name: "Presentación de la lección",
      type: "pdf",
      url: "/presentations/lesson1.pdf",
    },
    {
      id: 2,
      name: "Código de ejemplo",
      type: "zip",
      url: "/code/lesson1.zip",
    },
  ],
}

export default function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-[calc(100vh-8rem)] overflow-y-auto">
          <CardContent className="p-4">
            <Button variant="outline" className="w-full mb-4" asChild>
              <Link href={`/courses/${params.id}`}>
                <List className="mr-2 h-4 w-4" />
                Contenido del curso
              </Link>
            </Button>

            <div className="space-y-2">
              <h3 className="font-semibold mb-4">Módulo 1: Introducción</h3>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={`/courses/${params.id}/lessons/1`}>Lección 1: ¿Qué es el desarrollo web?</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={`/courses/${params.id}/lessons/2`}>Lección 2: Herramientas necesarias</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="aspect-video bg-black rounded-lg">{/* Aquí iría el reproductor de video */}</div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{lessonData.title}</h1>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/courses/${params.id}/lessons/${Number(params.lessonId) - 1}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/courses/${params.id}/lessons/${Number(params.lessonId) + 1}`}>
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground">{lessonData.description}</p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recursos de la lección</h2>
              <div className="space-y-2">
                {lessonData.resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <span>{resource.name}</span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={resource.url} download>
                        <DownloadCloud className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

