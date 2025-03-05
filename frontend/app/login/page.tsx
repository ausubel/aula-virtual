'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/ui/google-icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { saveToken, saveUserCVStatus, isAuthenticated, saveUserRole, saveUserId } from "@/lib/auth"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Eliminamos la verificación de autenticación previa para permitir el acceso a la página de login
  // independientemente del estado de autenticación

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await login(formData)
      
      if (result.success) {
        console.log('Login successful, user data:', result.data);
        
        // Guardar el token usando nuestro servicio de autenticación
        saveToken(result.data.token)
        
        // Redireccionar según el rol del usuario y si tiene CV
        const userRole = result.data.user[0].roleId
        const hasCV = result.data.user[0].hasCV
        const userId = result.data.user[0].id
        const cvStatus = result.data.user[0].hasCV
        
        console.log('User authenticated:', result.data.user);
        console.log('Token created:', result.data.token);
        console.log('User ID to save:', userId);
        
        // Guardar el estado del CV en una cookie
        saveUserCVStatus(cvStatus)

        // Guardar el rol del usuario en una cookie
        saveUserRole(userRole)

        // Guardar el ID del usuario en una cookie
        saveUserId(userId)

        if (userRole === 1) { // Asumiendo que 1 es admin
          router.push("/admin")
        } else if (userRole === 3) { // Profesor
          router.push("/teacher")
        } else if (!hasCV) {
          // Si el usuario no tiene CV, redirigir a la página de subida de CV
          router.push("/profile/upload-cv")
        } else {
          // Si el usuario ya tiene CV, redirigir a su perfil o dashboard según el rol
          if (userRole === 2) { // Estudiante
            router.push("/profile")
          } else {
            router.push("/profile")
          }
        }
      } else {
        // Mostrar mensaje de error
        toast({
          title: "Error de autenticación",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error en el login:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botón de Google en la parte superior */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 py-6"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon className="h-5 w-5" />
              Iniciar con Google
            </Button>
            
            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-muted-foreground">O continuar con email</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="Ingresa tu correo electrónico" 
                required 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="mt-1"
              />
            </div>
            
            <div className="text-right">
              
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">¿No tienes una cuenta? </span>
              <Link href="/register" className="text-sm font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </div>
            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
