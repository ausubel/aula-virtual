import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, BookOpen, BadgeIcon as Certificate, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Entrenamiento Gratuito para tu Desarrollo Profesional
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Impulsa tu carrera con nuestro programa de capacitación especializado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/register">Registrarse Ahora</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-600">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Beneficios del Programa</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">Contenido de Calidad</h3>
                  <p className="text-muted-foreground">
                    Accede a material educativo actualizado y relevante para tu desarrollo
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">Mentores Expertos</h3>
                  <p className="text-muted-foreground">
                    Aprende de profesionales con amplia experiencia en la industria
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">Evaluación Continua</h3>
                  <p className="text-muted-foreground">
                    Seguimiento personalizado de tu progreso y retroalimentación constante
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Certificate className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">Certificación</h3>
                  <p className="text-muted-foreground">
                    Obtén un certificado avalado al completar exitosamente el programa
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 text-blue-100">
            No pierdas la oportunidad de mejorar tus habilidades profesionales
          </p>
          <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-blue-50">
            <Link href="/register">Comenzar Ahora</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

