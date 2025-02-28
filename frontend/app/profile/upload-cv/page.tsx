'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isAuthenticated, getToken, decodeToken, hasUploadedCV, markCVAsUploaded, saveUserCVStatus } from '@/lib/auth'
import Cookies from 'js-cookie'

export default function UploadCVPage() {
  const router = useRouter()
  const [cv, setCv] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error', message: string } | null>(null)
  const [hasCheckedCV, setHasCheckedCV] = useState(false)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      console.error('No hay token, redirigiendo a login')
      router.push('/login')
      return
    }
    
    // Verificar si el usuario ya ha subido su CV
    // Solo hacemos esta verificación una vez para evitar bucles
    if (!hasCheckedCV) {
      setHasCheckedCV(true)
      
      if (hasUploadedCV()) {
        console.log('El usuario ya ha subido su CV, redirigiendo a la página de estudiante')
        router.push('/student')
      }
    }
  }, [router, hasCheckedCV])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCv(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!cv) {
      setFeedback({
        status: "error",
        message: "Por favor, selecciona un archivo PDF para tu CV."
      })
      return
    }
    
    setIsLoading(true)
    setFeedback(null)
    
    try {
      // Convertir el archivo a base64
      const base64File = await convertFileToBase64(cv)
      
      // Obtener el ID del usuario del token decodificado
      const token = getToken()
      let userId = 0
      
      if (token) {
        const decodedToken = decodeToken(token)
        userId = decodedToken?.id || 0
        console.log('ID de usuario obtenido del token:', userId)
      }
      
      // Si no se pudo obtener el ID del token, usar un valor por defecto para pruebas
      if (!userId) {
        userId = 2 // ID fijo para pruebas
        console.log('Usando ID de usuario fijo para pruebas:', userId)
      }
      
      // Enviar el archivo al servidor
      console.log('Enviando solicitud a:', `/api/document/student/${userId}/cv`)
      const response = await fetch(`/api/document/student/${userId}/cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: base64File })
      })
      
      console.log('Respuesta del servidor:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Error al subir el CV'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error('Error al parsear la respuesta:', e)
        }
        throw new Error(errorMessage)
      }
      
      // Marcar que el usuario ha subido su CV
      markCVAsUploaded()
      saveUserCVStatus(true)
      
      setFeedback({
        status: "success",
        message: "Tu CV ha sido subido correctamente. Serás redirigido a la página principal."
      })
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/student')
      }, 2000)
    } catch (error) {
      console.error('Error al subir el CV:', error)
      setFeedback({
        status: "error",
        message: error instanceof Error ? error.message : "Error al subir el CV. Por favor, intenta de nuevo."
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Función para convertir un archivo a base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sube tu CV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Para completar tu perfil y acceder a la plataforma, necesitamos que subas tu Curriculum Vitae en formato PDF.</p>
          
          {feedback && (
            <Alert className={`mb-4 ${feedback.status === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
              <Input 
                id="cv" 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || !cv}
              >
                {isLoading ? 'Subiendo...' : 'Subir CV'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
