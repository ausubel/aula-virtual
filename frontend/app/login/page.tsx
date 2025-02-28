'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/ui/google-icon"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { saveToken, saveUserCVStatus, isAuthenticated } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigirlo a la página principal
    if (isAuthenticated()) {
      router.push("/admin"); // O a la página que corresponda según el rol
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await login(formData)
      
      if (result.success) {
        // Guardar el token usando nuestro servicio de autenticación
        saveToken(result.data.token)
        
        // Redireccionar según el rol del usuario y si tiene CV
        const userRole = result.data.user[0].roleId
        const hasCV = result.data.user[0].hasCV
        
        // Guardar el estado del CV en una cookie
        saveUserCVStatus(hasCV)
        
        if (userRole === 1) { // Asumiendo que 1 es admin
          router.push("/admin")
        } else if (!hasCV) {
          // Si el usuario no tiene CV, redirigir a la página de subida de CV
          router.push("/profile/upload-cv")
        } else {
          // Si el usuario ya tiene CV, redirigir a su perfil o dashboard
          router.push("/profile")
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
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon className="h-5 w-5" />
            Iniciar con Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/forgot-password" className="hover:text-primary">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="hover:text-primary">
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
