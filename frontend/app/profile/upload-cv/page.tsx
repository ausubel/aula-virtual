'use client'

import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isAuthenticated, getToken, decodeToken, hasUploadedCV, markCVAsUploaded, saveUserCVStatus } from '@/lib/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FileIcon, UploadIcon, ArrowLeft } from 'lucide-react'
import Cookies from 'js-cookie'
// Importar el contexto de registro
import { RegistrationContext } from '@/app/register/page'

interface UserProfileData {
  firstName: string
  lastName: string
  phone: string
  career: string
  cv: File | null
}

interface UploadCVPageProps {
  onBackClick?: () => void;
}

export default function UploadCVPage({ onBackClick }: UploadCVPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error', message: string } | null>(null)
  const [hasCheckedCV, setHasCheckedCV] = useState(false)
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    career: "",
    cv: null,
  })

  // Obtener el contexto de registro
  const registrationContext = useContext(RegistrationContext);
  const isRegistrationFlow = registrationContext.isRegistrationFlow;

  useEffect(() => {
    // Si estamos en el flujo de registro, no necesitamos verificar la autenticación
    if (isRegistrationFlow) {
      return;
    }
    
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
  }, [router, hasCheckedCV, isRegistrationFlow])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, cv: file });
      
      // Crear URL para previsualización del PDF
      const fileUrl = URL.createObjectURL(file);
      setCvPreviewUrl(fileUrl);
      
      // Limpiar la URL al desmontar el componente
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validar que todos los campos estén completos
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.career) {
      setFeedback({
        status: "error",
        message: "Por favor, completa todos los campos del formulario."
      })
      return
    }
    
    if (!formData.cv) {
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
      const base64File = await convertFileToBase64(formData.cv)
      
      // Obtener el ID del usuario del token decodificado o del contexto de registro
      let userId = 0
      
      if (isRegistrationFlow && registrationContext.userId) {
        // Si estamos en el flujo de registro, usar el ID del contexto
        userId = registrationContext.userId;
        console.log('ID de usuario obtenido del contexto de registro:', userId)
      } else {
        // Si no, obtener el ID del token
        const token = getToken()
        
        if (token) {
          const decodedToken = decodeToken(token)
          userId = decodedToken?.id || 0
          console.log('ID de usuario obtenido del token:', userId)
        }
      }
      
      // Si no se pudo obtener el ID del token, usar un valor por defecto para pruebas
      if (!userId) {
        userId = 2 // ID fijo para pruebas
        console.log('Usando ID de usuario fijo para pruebas:', userId)
      }
      
      // Enviar los datos personales al servidor
      await fetch(`/api/user/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          career: formData.career
        })
      })
      
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
        message: "Tu perfil y CV han sido actualizados correctamente."
      })
      
      // Si estamos en el flujo de registro, llamar a la función onComplete del contexto
      if (isRegistrationFlow) {
        setTimeout(() => {
          registrationContext.onComplete();
        }, 1500);
      } else {
        // Si no, redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          router.push('/student')
        }, 2000)
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error)
      setFeedback({
        status: "error",
        message: error instanceof Error ? error.message : "Error al actualizar el perfil. Por favor, intenta de nuevo."
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
    <div className={cn(
      "flex items-center justify-center bg-gray-50",
      isRegistrationFlow ? "p-0" : "min-h-screen p-4"
    )}>
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6">
        {/* Formulario en la columna izquierda */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Completa tu perfil</CardTitle>
            <CardDescription>Para finalizar tu registro, completa tus datos personales y sube tu CV</CardDescription>
          </CardHeader>
          <CardContent>
            {feedback && (
              <Alert className={`mb-4 ${feedback.status === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
                <AlertDescription>{feedback.message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos personales */}
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
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    pattern="[0-9]{9}"
                    title="Ingrese un número de teléfono válido de 9 dígitos"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career">Carrera</Label>
                  <Select
                    name="career"
                    value={formData.career}
                    onValueChange={(value) => setFormData({ ...formData, career: value })}
                    disabled={isLoading}
                  >
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
              </div>

              {/* Subida de CV */}
              <div className="space-y-2">
                <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
                <Input 
                  id="cv" 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Por favor, sube tu CV en formato PDF. Este documento será utilizado para evaluar tu perfil.
                </p>
              </div>
              
              <div className="flex justify-between">
                {isRegistrationFlow && onBackClick && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackClick}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al paso anterior
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={!isRegistrationFlow || !onBackClick ? "ml-auto" : ""}
                >
                  {isLoading ? 'Guardando...' : 'Guardar y continuar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Previsualización del CV en la columna derecha */}
        <Card className="w-full md:w-1/2 flex flex-col">
          <CardHeader>
            <CardTitle>Vista previa de tu CV</CardTitle>
            <CardDescription>Asegúrate de que tu CV se vea correctamente antes de subirlo</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {cvPreviewUrl ? (
              <iframe 
                src={cvPreviewUrl} 
                className="w-full h-full min-h-[600px] border rounded-lg"
                title="Vista previa del CV"
              />
            ) : (
              <div className="w-full h-full min-h-[600px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                <FileIcon size={64} className="mb-4 opacity-30" />
                <p className="text-center mb-2">No se ha seleccionado ningún archivo PDF</p>
                <p className="text-center text-sm max-w-xs">Selecciona un archivo PDF en el formulario para ver una previsualización</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
