"use client"

import type React from "react"
import { useState, useEffect, createContext } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormFeedback } from "@/components/form-feedback"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"
import { Check, Info, FileIcon } from "lucide-react"
import { GoogleIcon } from "@/components/ui/google-icon"
import { register, registerBasicInfo } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from "@/components/ui/checkbox"
import dynamic from 'next/dynamic'

// Crear un contexto para compartir el estado de registro
export const RegistrationContext = createContext({
  isRegistrationFlow: false,
  userId: null as number | null,
  token: null as string | null,
  email: "", // Añadiendo email al contexto
  onComplete: () => {}
});

// Importar dinámicamente el componente UploadCVPage para evitar problemas de SSR
const UploadCVPage = dynamic(() => import('../profile/upload-cv/page'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[600px]">
      <LoadingSpinner className="h-8 w-8" />
      <span className="ml-2">Cargando formulario...</span>
    </div>
  )
})

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  career: string
  cv: File | null
  isRegistered: boolean
  acceptTerms: boolean
  acceptUpdates: boolean
}

// Función para validar requisitos de contraseña
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una mayúscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una minúscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
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

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    career: "",
    cv: null,
    isRegistered: false,
    acceptTerms: false,
    acceptUpdates: false
  })
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Validar contraseña cuando cambia
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  }, [formData.password]);

  // Limpiar la URL de previsualización al desmontar el componente
  useEffect(() => {
    return () => {
      if (cvPreviewUrl) {
        URL.revokeObjectURL(cvPreviewUrl);
      }
    };
  }, [cvPreviewUrl]);

  // Función para manejar el registro con Google
  const handleGoogleRegister = () => {
    window.location.href = '/auth/google/login'
  }

  // Manejar cambio de archivo CV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, cv: file });
      
      // Crear URL para previsualización del PDF
      const fileUrl = URL.createObjectURL(file);
      setCvPreviewUrl(fileUrl);
    }
  }

  // Función para manejar la finalización del registro
  const handleRegistrationComplete = () => {
    toast({
      title: "Registro completado",
      description: "Tu perfil ha sido actualizado correctamente. Serás redirigido al login.",
    });
    
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar que se aceptaron los términos
    if (!formData.acceptTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Crear FormData para enviar al servidor
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      
      // Llamar a la función de registro básico
      const result = await registerBasicInfo(formDataToSend);
      
      if (result.success) {
        // Si el registro fue exitoso, mostrar mensaje de éxito
        toast({
          title: "Registro exitoso",
          description: "Cuenta creada correctamente. Ahora puedes completar tu perfil.",
        });
        
        // Si recibimos un token, guardarlo en localStorage y en el estado
        if (result.token) {
          localStorage.setItem('token', result.token);
          setToken(result.token);
          console.log("Token guardado en localStorage");
        }
        
        // Si recibimos datos del usuario, guardarlos en localStorage
        if (result.userData) {
          localStorage.setItem('userData', JSON.stringify(result.userData));
          
          // Extraer el ID del usuario
          if (result.userData.id) {
            setUserId(result.userData.id);
            console.log("ID de usuario establecido:", result.userData.id);
          } else {
            console.error("Error: No se encontró ID de usuario en la respuesta", result.userData);
          }
          
          console.log("Datos del usuario guardados en localStorage:", result.userData);
        } else {
          console.error("Error: No se recibieron datos del usuario en la respuesta");
        }
        
        // Marcar como registrado y avanzar al siguiente paso
        setIsRegistered(true);
        setCurrentStep(2);
      } else {
        // Si hubo un error, mostrar mensaje de error
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos obligatorios estén completos
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Por favor, completa al menos tu nombre y apellidos",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Crear FormData para enviar al servidor
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      
      // Añadir campos adicionales si están presentes
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.career) formDataToSend.append('career', formData.career);
      
      // Convertir CV a base64 si existe
      if (formData.cv) {
        const base64File = await convertFileToBase64(formData.cv);
        formDataToSend.append('cv', base64File);
      }
      
      // Llamar a la función de registro completo
      const result = await register(formDataToSend);
      
      if (result.success) {
        // Si el registro fue exitoso, mostrar mensaje de éxito
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Serás redirigido al login.",
        });
        
        // Si recibimos un token, guardarlo en localStorage
        if (result.token) {
          localStorage.setItem('token', result.token);
          console.log("Token guardado en localStorage");
        }
        
        // Si recibimos datos del usuario, guardarlos en localStorage
        if (result.userData) {
          localStorage.setItem('userData', JSON.stringify(result.userData));
          console.log("Datos del usuario guardados en localStorage");
        }
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // Si hubo un error, mostrar mensaje de error
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para volver al paso 1
  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  // Valores del contexto de registro
  const registrationContextValue = {
    isRegistrationFlow: true,
    userId,
    token,
    email: formData.email, // Pasando el email actual al contexto
    onComplete: handleRegistrationComplete
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={cn("w-full", currentStep === 1 ? "max-w-md" : "max-w-7xl")}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crear una cuenta</CardTitle>
          {currentStep === 1 && (
            <CardDescription>Completa tus datos para registrarte</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {/* Stepper - solo mostrar si estamos en el paso 2 */}
          {currentStep === 2 && (
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
          )}

          {currentStep === 1 ? (
            <>
              {/* Botón de Google en la parte superior */}
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 py-6"
                  onClick={handleGoogleRegister}
                >
                  <GoogleIcon className="h-5 w-5" />
                  Registrarse con Google
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
              
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={isLoading}
                      className="mt-1"
                    />
                    
                    {/* Requisitos de contraseña */}
                    {formData.password && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`w-3 h-3 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-600'}>Mínimo 8 caracteres</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`w-3 h-3 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>Una mayúscula</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`w-3 h-3 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>Una minúscula</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`w-3 h-3 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>Un número</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`w-3 h-3 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>Un carácter especial</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                      className="mt-1"
                    />
                    {formData.confirmPassword && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <div className={`w-3 h-3 rounded-full ${formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'}>
                          {formData.password === formData.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Términos y condiciones */}
                <div className="space-y-3 mt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="acceptUpdates" 
                      checked={formData.acceptUpdates}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, acceptUpdates: checked as boolean })
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="acceptUpdates"
                        className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Quiero recibir actualizaciones, ofertas especiales y comunicaciones promocionales.
                      </label>
                      <p className="text-xs text-gray-500">
                        Entiendo que puedo darme de baja en cualquier momento.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="acceptTerms" 
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, acceptTerms: checked as boolean })
                      }
                      required
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acepto los <Link href="#" className="text-primary hover:underline">Términos de Servicio</Link> y la <Link href="#" className="text-primary hover:underline">Política de Privacidad</Link>.
                      </label>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={isLoading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword || !formData.acceptTerms}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Registrando...
                    </>
                  ) : (
                    "Registrarse"
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <span className="text-sm text-muted-foreground">¿Ya tienes una cuenta? </span>
                  <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                    Iniciar sesión
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="w-full">
              {/* Renderizar el componente UploadCVPage dentro del contexto */}
              <RegistrationContext.Provider value={registrationContextValue}>
                <div className="upload-cv-container">
                  <UploadCVPage onBackClick={handleBackToStep1} />
                </div>
              </RegistrationContext.Provider>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}