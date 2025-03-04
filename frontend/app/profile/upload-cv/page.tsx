'use client'

import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isAuthenticated, hasUploadedCV, markCVAsUploaded, saveUserCVStatus, getUserIdFromToken } from '@/lib/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FileIcon, UploadIcon, ArrowLeft, EyeIcon, EyeOffIcon } from 'lucide-react'
import Cookies from 'js-cookie'
// Importar el contexto de registro
import { RegistrationContext } from '@/app/register/page'

interface UserProfileData {
  firstName: string
  lastName: string
  phone: string
  degree: string
  otherDegree?: string
  email: string
  password: string
  confirmPassword: string
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    degree: "",
    otherDegree: "",
    email: "",
    password: "",
    confirmPassword: "",
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
        router.push('/courses')
      }
    }

    // Obtener los datos del usuario para autocompletar el formulario
    const fetchUserData = async () => {
      try {
        // Intentar obtener el ID del usuario de la cookie
        let userId = Number(Cookies.get('user_id'));
        console.log('userId from cookie:', userId);
        
        // Si no hay ID en la cookie, intentar obtenerlo del token
        if (!userId) {
          console.log('No se encontró el ID del usuario en las cookies, intentando obtenerlo del token');
          
          const tokenUserId = getUserIdFromToken();
          
          if (tokenUserId) {
            userId = Number(tokenUserId);
            console.log('ID de usuario obtenido del token:', userId);
            
            // Actualizar la cookie con el ID correcto
            Cookies.set('user_id', userId.toString(), { expires: 7 });
          } else {
            console.error('No se pudo obtener el ID del usuario del token');
            return;
          }
        }

        // Intentar obtener los datos del usuario desde el backend
        console.log(`Intentando obtener datos del usuario con ID: ${userId}`);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user/${userId}`;
        console.log('URL de la API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`Error al obtener datos del usuario: ${response.status} ${response.statusText}`);
          return;
        }

        const userData = await response.json();
        console.log('Datos recibidos del servidor:', userData);
        
        // Verificar que los datos tengan el formato esperado
        if (!userData.data || !Array.isArray(userData.data) || userData.data.length === 0) {
          console.error('Formato de datos de usuario inesperado:', userData);
          return;
        }
        
        // Extraer los datos del usuario de la respuesta
        const user = userData.data[0];
        console.log('Datos del usuario extraídos:', user);
        
        if (user) {
          setFormData(prevData => ({
            ...prevData,
            firstName: user.name || prevData.firstName,
            lastName: user.surname || prevData.lastName,
            email: user.email || prevData.email,
            // Extraer el número de teléfono sin el prefijo +51 si existe
            phone: user.phone ? user.phone.replace(/^\+51/, '') : prevData.phone,
          }));
          console.log('Formulario actualizado con datos del usuario');
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };

    fetchUserData();

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
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.degree || !formData.email || !formData.password || !formData.confirmPassword || (formData.degree === "other" && !formData.otherDegree)) {
      setFeedback({
        status: "error",
        message: "Por favor, completa todos los campos del formulario."
      })
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFeedback({
        status: "error",
        message: "Las contraseñas no coinciden."
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
      
      let userId = 0
      
      if (isRegistrationFlow && registrationContext.userId) {
        // Si estamos en el flujo de registro, usar el ID del contexto
        userId = registrationContext.userId;
        console.log('ID de usuario obtenido del contexto de registro:', userId)
      } else {
        userId = Number(Cookies.get('user_id'));
        console.log('ID de usuario obtenido del token:', userId)
      }
      const user = JSON.stringify({
        id: userId,
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        degree: formData.degree === "other" ? formData.otherDegree : formData.degree,
        hasCV: true,
      })
      console.log(user);
      // Enviar los datos personales al servidor
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: user
      })
      
      // Enviar el archivo al servidor
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/document/student/${userId}/cv`, {
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
          router.push('/courses')
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
        <Card className="w-full md:w-1/2 shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Completa tu perfil</CardTitle>
            <CardDescription>Para finalizar tu registro, completa tus datos personales y sube tu CV</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {feedback && (
              <Alert className={`mb-4 ${feedback.status === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
                <AlertDescription>{feedback.message}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-muted-foreground mb-6">Los campos marcados con <span className="text-red-500">*</span> son obligatorios.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos personales */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Información personal</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Apellidos <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Correo electrónico <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={true}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Teléfono <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          pattern="[0-9]{9}"
                          title="Ingrese un número de teléfono válido de 9 dígitos"
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').substring(0, 9);
                            setFormData({ ...formData, phone: value });
                          }}
                          disabled={isLoading}
                          className="w-full"
                          placeholder="987654321"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Ingrese solo los 9 dígitos de su número celular</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree">
                        Carrera <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        name="degree"
                        value={formData.degree}
                        onValueChange={(value) => setFormData({ ...formData, degree: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger aria-label="Selecciona tu carrera" className="w-full">
                          <SelectValue placeholder="Selecciona tu carrera" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                          <SelectItem value="Administración">Administración</SelectItem>
                          <SelectItem value="Tecnologías de la Información">Tecnologías de la Información</SelectItem>
                          <SelectItem value="other">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.degree === "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="otherDegree">
                          Otra carrera <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="otherDegree"
                          name="otherDegree"
                          value={formData.otherDegree}
                          onChange={(e) => setFormData({ ...formData, otherDegree: e.target.value })}
                          disabled={isLoading}
                          className="w-full"
                          required
                          placeholder="Especifica tu carrera"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Contraseña</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="******"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          disabled={isLoading}
                          className="w-full pr-10"
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                          }}
                        >
                          {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmar contraseña <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="******"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          disabled={isLoading}
                          className="w-full pr-10"
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                        >
                          {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subida de CV */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Curriculum Vitae</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cv">
                      Curriculum Vitae (PDF) <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="cv" 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Por favor, sube tu CV en formato PDF. Este documento será utilizado para evaluar tu perfil.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t mt-6">
                {isRegistrationFlow && onBackClick && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackClick}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al paso anterior
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={cn(
                    "flex items-center gap-2",
                    !isRegistrationFlow || !onBackClick ? "ml-auto" : ""
                  )}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4" />
                      Guardar y continuar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Previsualización del CV en la columna derecha */}
        <Card className="w-full md:w-1/2 flex flex-col shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Vista previa de tu CV</CardTitle>
            <CardDescription>Asegúrate de que tu CV se vea correctamente antes de subirlo</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {cvPreviewUrl ? (
              <iframe 
                src={cvPreviewUrl} 
                className="w-full h-full min-h-[600px] border rounded-lg shadow-inner"
                title="Vista previa del CV"
              />
            ) : (
              <div className="w-full h-full min-h-[600px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-gray-50">
                <FileIcon size={64} className="mb-4 opacity-30" />
                <p className="text-center mb-2 font-medium">No se ha seleccionado ningún archivo PDF</p>
                <p className="text-center text-sm max-w-xs">Selecciona un archivo PDF en el formulario para ver una previsualización</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
