import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server"

    const email = formData.get("email")
    const password = formData.get("password")

    // Esta es una autenticación simulada - en una app real verificarías contra una base de datos
    if (email === "admin@test.com" && password === "admin") {
      redirect("/admin")
    } else if (email === "student@test.com" && password === "student") {
      redirect("/dashboard")
    }

    // Aquí manejarías el caso de credenciales inválidas
    return { error: "Credenciales inválidas" }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
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

