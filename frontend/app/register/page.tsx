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
import dynamic from 'next/dynamic'

// Crear un contexto para compartir el estado de registro
export const RegistrationContext = createContext({
  isRegistrationFlow: false,
  userId: null as number | null,
  token: null as string | null,
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
    isRegistered: false
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
          }
          console.log("Datos del usuario guardados en localStorage");
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
    onComplete: handleRegistrationComplete
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={cn("w-full", currentStep === 1 ? "max-w-2xl" : "max-w-7xl")}>
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
                    {/* Requisitos de contraseña */}
                    <div className="text-sm mt-2 p-3 bg-gray-100 rounded-md border border-gray-200">
                      <div className="flex items-center gap-1 text-gray-500 mb-1">
                        <Info className="h-4 w-4" />
                        <span>Requisitos de contraseña:</span>
                      </div>
                      <ul className="space-y-1 list-disc pl-5 text-xs text-gray-600">
                        <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>Mínimo 8 caracteres</li>
                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>Al menos una mayúscula</li>
                        <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>Al menos una minúscula</li>
                        <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>Al menos un número</li>
                        <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>Al menos un carácter especial (!@#$%^&*)</li>
                      </ul>
                    </div>
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
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">Las contraseñas no coinciden</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Registrando...
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
            <div className="w-full">
              {/* Botón para volver al paso 1 */}
              <div className="mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToStep1}
                  className="mb-4"
                >
                  Volver al paso anterior
                </Button>
              </div>
              
              {/* Renderizar el componente UploadCVPage dentro del contexto */}
              <RegistrationContext.Provider value={registrationContextValue}>
                <div className="upload-cv-container">
                  <UploadCVPage />
                </div>
              </RegistrationContext.Provider>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}