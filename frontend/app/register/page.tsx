"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormFeedback } from "@/components/form-feedback"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    status: "success" | "error" | "warning"
    message: string
  } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setFeedback(null)

    const formData = new FormData(event.currentTarget)
    
    try {
      // Convert CV file to base64
      const cvFile = formData.get('cv') as File
      if (!cvFile || !(cvFile instanceof File)) {
        throw new Error('Por favor, seleccione un archivo PDF válido')
      }

      if (!cvFile.type.includes('pdf')) {
        throw new Error('El archivo debe ser un PDF')
      }

      const cvBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(new Error('Error al procesar el archivo: ' + error))
        reader.readAsDataURL(cvFile)
      })

      // Get only the base64 data without the data URL prefix
      const base64Data = cvBase64.split(',')[1]

      const payload = {
        name: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phoneNumber: formData.get('phone'),
        profession: formData.get('career'),
        cv_file: base64Data
      }

      const response = await fetch('/api/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar')
      }

      setFeedback({
        status: "success",
        message: "Registro exitoso. Redirigiendo...",
      })

      // Redirect or show success message
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)

    } catch (error) {
      setFeedback({
        status: "error",
        message: error instanceof Error ? error.message : "Error al procesar el registro",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Registro de Participante</CardTitle>
          <CardDescription>Complete el formulario para inscribirse en el programa de entrenamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" required aria-required="true" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" name="lastName" required aria-required="true" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" required aria-required="true" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  aria-required="true"
                  disabled={isLoading}
                  pattern="[0-9]{9}"
                  title="Ingrese un número de teléfono válido de 9 dígitos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">Carrera</Label>
                <Select name="career" required disabled={isLoading}>
                  <SelectTrigger aria-label="Selecciona tu carrera">
                    <SelectValue placeholder="Selecciona tu carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Ingeniería</SelectItem>
                    <SelectItem value="business">Administración</SelectItem>
                    <SelectItem value="it">Tecnologías de la Información</SelectItem>
                    <SelectItem value="other">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
                <Input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf"
                  required
                  aria-required="true"
                  disabled={isLoading}
                  aria-label="Subir Curriculum Vitae en formato PDF"
                />
              </div>
            </div>

            {feedback && <FormFeedback status={feedback.status} message={feedback.message} />}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" disabled={isLoading} asChild>
                <Link href="/templates/cv-template.pdf" download>
                  Descargar Plantilla CV
                </Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Registrando...
                  </>
                ) : (
                  "Registrarse"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
