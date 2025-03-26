'use server'

import { z } from 'zod'

// Schema para validación de credenciales básicas - debe coincidir con registerSchema del backend
const basicInfoSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
})

// Schema para validación del perfil completo
const profileSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  career: z.string().optional(),
})

// Función para imprimir logs numerados
function logStep(step: number | string, message: string, data?: any) {
  if (data) {
  }
}

// Paso 1: Registro básico con email y contraseña
export async function registerBasicInfo(formData: FormData) {
  try {
    logStep(1, "Iniciando proceso de registro básico");
    
    // Extraer datos del formulario
    const email = formData.get('email');
    const password = formData.get('password');
    
    logStep(2, "Datos extraídos del formulario", { email, password: "********" });
    
    // Validar datos
    logStep(3, "Validando datos con Zod");
    const validatedData = basicInfoSchema.parse({
      email,
      password,
    });
    logStep(4, "Validación exitosa", { email: validatedData.email });

    // Prepare datos para el endpoint de autenticación
    logStep(5, "Preparando datos para el backend");
    
    // IMPORTANTE: Vamos a usar el endpoint de autenticación que ya funciona
    // Siguiendo el modelo de Google Auth que usa get_or_create_google_user
    const userData = {
      email: validatedData.email,
      password: validatedData.password,
      name: "Usuario", 
      surname: "Nuevo"
    }

    logStep(6, "Datos preparados", {
      ...userData,
      password: "********" // No mostrar la contraseña real en logs
    });

    // Usar la variable de entorno para la URL de la API
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
    logStep(7, `Realizando petición a: ${NEXT_PUBLIC_API_URL}/auth/register`);
    
    // Imprimir el cuerpo de la petición exactamente como se enviará
    const requestBody = JSON.stringify(userData);
    logStep('7.1', "Cuerpo de la petición (JSON)", requestBody);
    
    // Enviar los datos al endpoint de autenticación
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    logStep(8, `Respuesta recibida - Status: ${response.status}`);
    logStep('8.1', "Headers de la respuesta", {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });
    
    // Intentar obtener el cuerpo de la respuesta
    let data;
    let responseText = '';
    try {
      // Primero intentamos obtener el texto de la respuesta para depuración
      responseText = await response.clone().text();
      logStep('8.2', "Texto de la respuesta", responseText);
      
      // Luego intentamos parsear como JSON
      data = await response.json();
      logStep(9, "Datos de la respuesta (JSON)", data);
      
      // Verificar específicamente si tenemos un ID de usuario
      if (data?.data?.user?.[0]?.id) {
        logStep('9.1', "ID de usuario encontrado:", data.data.user[0].id);
      } else {
        logStep('9.2', "No se encontró ID de usuario en la respuesta. Estructura de data:", JSON.stringify(data?.data));
      }
    } catch (error) {
      logStep(9, "Error al parsear la respuesta JSON", { error, responseText });
      data = { message: "Error al procesar la respuesta del servidor" };
    }

    if (!response.ok) {
      logStep(10, "Error en la respuesta", { status: response.status, message: data?.message });
      return {
        success: false,
        message: data?.message || 'Error al registrar usuario',
      }
    }

    // Guardar el token en localStorage o cookies si es necesario
    if (data?.data?.token) {
      logStep(11, "Guardando token", { token: data.data.token.substring(0, 10) + '...' });
      // Aquí podrías guardar el token en localStorage o cookies
    }

    // Verificar y asegurar que userData tenga una estructura válida
    // El usuario viene dentro de un array en data.user
    const userResult = Array.isArray(data?.data?.user) && data?.data?.user.length > 0 
      ? data.data.user[0] 
      : {};
    
    // Extraer explícitamente los datos importantes del usuario
    const processedUserData = {
      id: userResult.id || null,
      email: userResult.email || validatedData.email,
      name: userResult.name || "Usuario",
      surname: userResult.surname || "Nuevo",
      // Otros campos relevantes...
    };
    
    logStep(12, "Procesamiento de datos de usuario completado", processedUserData);

    logStep(13, "Registro exitoso");
    return {
      success: true,
      message: 'Registro inicial exitoso. Ahora complete su perfil.',
      email: validatedData.email,
      token: data?.data?.token,
      userData: processedUserData
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      logStep('E1', "Error de validación Zod", { errors: error.errors });
      return {
        success: false,
        message: error.errors[0].message,
      }
    }

    // Verificar si es un error de red
    if (error instanceof Error) {
      logStep('E2', "Error específico", { message: error.message, stack: error.stack });
      
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          success: false,
          message: 'No se pudo conectar al servidor. Verifique su conexión a internet.',
        }
      }
    }

    logStep('E3', "Error desconocido", { error });
    return {
      success: false,
      message: 'Error interno del servidor',
    }
  }
}

// Función original para registro completo (mantenida por compatibilidad)
export async function register(formData: FormData) {
  try {
    logStep(1, "Iniciando proceso de registro completo");
    
    // Extraer y validar datos básicos
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    // Extraer datos adicionales opcionales
    const phone = formData.get('phone') as string;
    const career = formData.get('career') as string;
    const cvBase64 = formData.get('cv') as string;
    
    logStep(2, "Datos extraídos del formulario", { 
      email, 
      password: "********",
      firstName,
      lastName,
      phone: phone || "(no proporcionado)",
      career: career || "(no proporcionado)",
      cv: cvBase64 ? "Archivo PDF presente" : "(no proporcionado)"
    });
    
    // Validar datos
    logStep(3, "Validando datos con Zod");
    const validatedData = {
      ...basicInfoSchema.parse({ email, password }),
      ...profileSchema.parse({ 
        firstName, 
        lastName,
        phone: phone || undefined,
        career: career || undefined
      })
    };
    
    logStep(4, "Validación exitosa");

    // Preparar datos para el endpoint de autenticación
    logStep(5, "Preparando datos para el backend");
    const userData = {
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.firstName,
      surname: validatedData.lastName,
      // Añadir campos adicionales si están presentes
      ...(validatedData.phone && { phoneNumber: validatedData.phone }),
      ...(validatedData.career && { profession: validatedData.career }),
      ...(cvBase64 && { cv_file: cvBase64 })
    }
    
    logStep(6, "Datos preparados", {
      ...userData,
      password: "********", // No mostrar la contraseña real en logs
      cv_file: cvBase64 ? "Archivo PDF presente (base64)" : undefined
    });

    // Usar la variable de entorno para la URL de la API
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
    logStep(7, `Realizando petición a: ${NEXT_PUBLIC_API_URL}/auth/register`);
    
    // Imprimir el cuerpo de la petición exactamente como se enviará
    const requestBody = JSON.stringify(userData);
    logStep('7.1', "Cuerpo de la petición (JSON)", requestBody.substring(0, 500) + (requestBody.length > 500 ? '...' : ''));
    
    // Llamar al endpoint de registro
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    })
    logStep(8, `Respuesta recibida - Status: ${response.status}`);
    logStep('8.1', "Headers de la respuesta", {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    // Intentar obtener el cuerpo de la respuesta
    let data;
    let responseText = '';
    try {
      // Primero intentamos obtener el texto de la respuesta para depuración
      responseText = await response.clone().text();
      logStep('8.2', "Texto de la respuesta", responseText);
      
      // Luego intentamos parsear como JSON
      data = await response.json();
      logStep(9, "Datos de la respuesta (JSON)", data);
    } catch (error) {
      logStep(9, "Error al parsear la respuesta JSON", { error, responseText });
      data = { message: "Error al procesar la respuesta del servidor" };
    }

    if (!response.ok) {
      logStep(10, "Error en la respuesta", { status: response.status, message: data?.message });
      return {
        success: false,
        message: data?.message || 'Error al registrar usuario',
      }
    }

    // Guardar el token en localStorage o cookies si es necesario
    if (data?.data?.token) {
      logStep(11, "Guardando token", { token: data.data.token.substring(0, 10) + '...' });
      // Aquí podrías guardar el token en localStorage o cookies
    }

    logStep(12, "Registro exitoso");
    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      token: data?.data?.token,
      userData: data?.data?.user
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      logStep('E1', "Error de validación Zod", { errors: error.errors });
      return {
        success: false,
        message: error.errors[0].message,
      }
    }

    logStep('E2', "Error desconocido", { error });
    return {
      success: false,
      message: 'Error interno del servidor',
    }
  }
}