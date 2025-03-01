'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpenIcon, GraduationCapIcon, UsersIcon, AwardIcon, ArrowRightIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const features = [
    {
      icon: <BookOpenIcon className="h-10 w-10 text-primary" />,
      title: "Cursos Interactivos",
      description: "Accede a una amplia variedad de cursos interactivos diseñados para mejorar tu aprendizaje."
    },
    {
      icon: <UsersIcon className="h-10 w-10 text-primary" />,
      title: "Comunidad Activa",
      description: "Conecta con otros estudiantes y profesores para compartir conocimientos y experiencias."
    },
    {
      icon: <GraduationCapIcon className="h-10 w-10 text-primary" />,
      title: "Seguimiento de Progreso",
      description: "Monitorea tu avance académico con herramientas de seguimiento detalladas."
    },
    {
      icon: <AwardIcon className="h-10 w-10 text-primary" />,
      title: "Certificaciones",
      description: "Obtén certificados reconocidos al completar satisfactoriamente los cursos."
    }
  ]
  
  const popularCourses = [
    {
      id: 1,
      title: "Introducción a la Programación",
      instructor: "Dr. Carlos Mendoza",
      category: "Programación",
      level: "Principiante",
      students: 1245,
      image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2831&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Desarrollo Web Avanzado",
      instructor: "Ing. María Rodríguez",
      category: "Desarrollo Web",
      level: "Avanzado",
      students: 892,
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Inteligencia Artificial para Todos",
      instructor: "Dr. Javier López",
      category: "IA",
      level: "Intermedio",
      students: 1056,
      image: "https://images.unsplash.com/photo-1677442135136-760c813028c0?q=80&w=2532&auto=format&fit=crop"
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Bienvenido a tu Aula Virtual</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Aprende a tu ritmo, expande tus conocimientos y alcanza tus metas académicas con nuestra plataforma educativa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/courses">
                Explorar Cursos <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/profile">
                Mi Perfil
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-10"></div>
      </section>

      {/* Search Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 py-6 text-lg"
            placeholder="Buscar cursos, temas o instructores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir nuestra plataforma?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Cursos Populares</h2>
          <Button variant="ghost" asChild>
            <Link href="/courses">
              Ver todos <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription>{course.instructor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{course.category}</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {course.level}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{course.students} estudiantes</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/courses/${course.id}`}>
                    Ver Curso
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 px-4 rounded-3xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para comenzar tu viaje de aprendizaje?</h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de estudiantes que están transformando sus vidas a través de la educación en línea.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/courses">
              Comenzar Ahora <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

