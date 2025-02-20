import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  async function resetPassword(formData: FormData) {
    "use server"
    // Aquí iría la lógica para enviar el email de recuperación
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required />
            </div>
            <Button type="submit" className="w-full">
              Enviar Instrucciones
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-muted-foreground">
            <Link href="/login" className="hover:text-primary">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

