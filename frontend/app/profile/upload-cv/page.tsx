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
import { SweetAlert } from '@/utils/SweetAlert'

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
  // Estados para validación de contraseña
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  })
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
    // Si estamos en el flujo de registro, establecer el correo electrónico desde el contexto
    if (isRegistrationFlow && registrationContext.email) {
      setFormData(prevData => ({
        ...prevData,
        email: registrationContext.email
      }));
    }
    
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
        router.push('/student/courses')
      }
    }

    // Obtener los datos del usuario para autocompletar el formulario
    const fetchUserData = async () => {
      try {
        // Intentar obtener el ID del usuario de la cookie
        let userId = Number(Cookies.get('user_id'));
        
        // Si no hay ID en la cookie, intentar obtenerlo del token
        if (!userId) {
          
          const tokenUserId = getUserIdFromToken();
          
          if (tokenUserId) {
            userId = Number(tokenUserId);
            Cookies.set('user_id', userId.toString(), { expires: 7 });
          } else {
            console.error('No se pudo obtener el ID del usuario del token');
            return;
          }
        }

        // Intentar obtener los datos del usuario desde el backend
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`;
        
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
        
        // Verificar que los datos tengan el formato esperado
        if (!userData.data || !Array.isArray(userData.data) || userData.data.length === 0) {
          console.error('Formato de datos de usuario inesperado:', userData);
          return;
        }
        
        // Extraer los datos del usuario de la respuesta
        const user = userData.data[0];
        
        if (user) {
          setFormData(prevData => ({
            ...prevData,
            firstName: user.name || prevData.firstName,
            lastName: user.surname || prevData.lastName,
            email: user.email || prevData.email,
            // Extraer el número de teléfono sin el prefijo +51 si existe
            phone: user.phone ? user.phone.replace(/^\+51/, '') : prevData.phone,
          }));
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
      
      // Verificar el tamaño del archivo (1 MB = 1048576 bytes)
      if (file.size > 1048576) {
        SweetAlert.error('Error', 'El archivo es demasiado grande. El tamaño máximo permitido es 1 MB.');
        // Limpiar el input de archivo
        e.target.value = '';
        return;
      }
      
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

  // Función para validar la contraseña
  const validatePassword = (password: string) => {
    const validations = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
    setPasswordValidations(validations)
    return validations
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    validatePassword(newPassword)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validar que todos los campos estén completos (excluyendo contraseña si está en flujo de registro)
    if (isRegistrationFlow) {
      // En flujo de registro, solo validar campos personales y CV
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
        SweetAlert.error('Error', 'Por favor, completa todos los campos del formulario.')
        return
      }
    } else {
      // Fuera del flujo de registro, validar todos los campos incluyendo contraseña
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
        SweetAlert.error('Error', 'Por favor, completa todos los campos del formulario.')
        return
      }
      
      // Validar requisitos de contraseña solo si no está en flujo de registro
      const validations = validatePassword(formData.password)
      if (!Object.values(validations).every(Boolean)) {
        SweetAlert.error('Error', 'La contraseña no cumple con todos los requisitos de seguridad.')
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        SweetAlert.error('Error', 'Las contraseñas no coinciden.')
        return
      }
    }
    
    if (!formData.cv) {
      SweetAlert.error('Error', 'Por favor, selecciona un archivo PDF para tu CV.')
      return
    }
    
    setIsLoading(true)
    setFeedback(null)
    
    try {
      // Convertir el archivo a base64
      const base64File = await convertFileToBase64(formData.cv)
      
      let userId = 0
      
      if (isRegistrationFlow) {
        // Si estamos en el flujo de registro, usar el ID del contexto
        if (registrationContext.userId) {
          userId = registrationContext.userId;
        } else {
          SweetAlert.error('Error', 'No se pudo obtener el ID de usuario. Por favor, intente registrarse nuevamente.');
          setIsLoading(false);
          return;
        }
      } else {
        // Si NO estamos en el flujo de registro (actualización de perfil), obtener ID de las cookies
        const cookieUserId = Cookies.get('user_id');
        if (cookieUserId) {
          userId = Number(cookieUserId);
        } else {
          // Intentar obtener el ID del token como último recurso
          const tokenUserId = getUserIdFromToken();
          if (tokenUserId) {
            userId = Number(tokenUserId);
          } else {
            console.error('Error: No se pudo obtener el ID del usuario');
            SweetAlert.error('Error', 'No se pudo obtener el ID de usuario. Por favor, intente iniciar sesión nuevamente.');
            setIsLoading(false);
            return;
          }
        }
      }

      // Validación adicional para asegurarnos de que userId no sea 0, NaN o null
      if (!userId || isNaN(userId) || userId <= 0) {
        console.error('ID de usuario inválido:', userId);
        throw new Error("No se pudo obtener un ID de usuario válido. Por favor, inténtelo de nuevo.");
      }
      
      // Verificación adicional - imprimir el objeto userData para comprobar que el ID es correcto
      const user = {
        id: userId,
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        degree: formData.degree === "other" ? formData.otherDegree : formData.degree,
        hasCV: true,
      };
      
      const userJson = JSON.stringify(user);
      
      // Enviar los datos personales al servidor
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: userJson
      });
      
      
      if (!updateResponse.ok) {
        let errorMessage = 'Error al actualizar los datos de usuario';
        try {
          const errorData = await updateResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error al parsear la respuesta:', e);
        }
        throw new Error(errorMessage);
      }
      
      // Enviar el archivo al servidor - usando el ID de usuario correcto
      const cvEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/document/student/${userId}/cv`;
      
      const response = await fetch(cvEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: base64File })
      });
      
      
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
          router.push('/student/courses')
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
      reader.onload = () => {
        // Obtener solo la parte base64 sin el prefijo MIME
        const base64String = reader.result as string
        const base64Content = base64String.split(',')[1]
        resolve(base64Content)
      }
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
                    {/* <div className="space-y-2">
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
                    </div> */}
                    {/* {formData.degree === "other" && (
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
                    )} */}
                  </div>
                </div>

                {/* Sección de contraseña - solo mostrar si NO está en flujo de registro */}
                {!isRegistrationFlow && (
                  <>
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
                              required={!isRegistrationFlow}
                              value={formData.password}
                              onChange={handlePasswordChange}
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
                              required={!isRegistrationFlow}
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
                    
                      {/* Requisitos de contraseña */}
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${passwordValidations.minLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidations.minLength ? 'text-green-600' : 'text-gray-500'}>Mínimo 8 caracteres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${passwordValidations.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidations.hasUppercase ? 'text-green-600' : 'text-gray-500'}>Una mayúscula</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${passwordValidations.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidations.hasLowercase ? 'text-green-600' : 'text-gray-500'}>Una minúscula</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${passwordValidations.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidations.hasNumber ? 'text-green-600' : 'text-gray-500'}>Un número</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${passwordValidations.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={passwordValidations.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>Un carácter especial</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

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
                <FileIcon className="w-12 h-12 mb-4" />
                <p className="text-lg">No se ha seleccionado ningún archivo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}