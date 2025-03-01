"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormFeedback } from "@/components/form-feedback"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { GoogleIcon } from "@/components/ui/google-icon"
import { register } from "./actions"
import { toast } from "@/components/ui/use-toast"

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  // Función para manejar el registro con Google
  const handleGoogleRegister = () => {
    window.location.href = '/auth/google/login'
  }

  async function handleAccountSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    setCurrentStep(2)
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Crear FormData con todos los campos
      const data = new FormData()
      data.append('email', formData.email)
      data.append('password', formData.password)
      data.append('firstName', formData.firstName)
      data.append('lastName', formData.lastName)

      const result = await register(data)

      if (result.success) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Serás redirigido al login.",
        })
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error durante el registro:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error durante el registro. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Registro de Estudiante</CardTitle>
          <CardDescription>Complete el formulario para crear su cuenta de estudiante</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  <Check className="w-5 h-5" />
                </div>
                <div className={cn("h-1 w-24", currentStep === 2 ? "bg-primary" : "bg-muted")} />
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  2
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-1">
              <div className="flex gap-16">
                <span className="text-sm font-medium">Cuenta</span>
                <span className={cn("text-sm", currentStep === 2 ? "font-medium" : "text-muted-foreground")}>
                  Datos Personales
                </span>
              </div>
            </div>
          </div>

          {currentStep === 1 ? (
            <>
              <form onSubmit={handleAccountSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Validando...
                      </>
                    ) : (
                      "Continuar"
                    )}
                  </Button>
                </div>
              </form>
              <div className="relative mt-4 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-muted-foreground">O registrarse con</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-2/3 gap-2"
                    onClick={handleGoogleRegister}
                  >
                    <GoogleIcon className="h-5 w-5" />
                    Registrarse con Google
                  </Button>
                </div>
                <div className="flex justify-between mt-4">
                  <div>
                    <span className="text-sm text-muted-foreground">¿Ya tienes una cuenta? </span>
                    <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                      Iniciar sesión
                    </Link>
                  </div>
                  <Button variant="outline" type="button" disabled={isLoading} asChild>
                    <Link href="/">Cancelar</Link>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  Atrás
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Registrando...
                    </>
                  ) : (
                    "Completar Registro"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}