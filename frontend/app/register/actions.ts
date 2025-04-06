'use server'

import { z } from 'zod'
import { serverApi } from '@/lib/server-api'

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

    logStep(7, "Realizando petición a: /auth/register");
    
    // Imprimir el cuerpo de la petición exactamente como se enviará
    logStep('7.1', "Cuerpo de la petición (JSON)", userData);
    
    // Enviar los datos al endpoint de autenticación usando serverApi
    const response = await serverApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    logStep(8, `Respuesta recibida - Status: ${response.success ? 'success' : 'error'}`);
    logStep('8.1', "Datos de la respuesta", response.data);
    
    // Intentar obtener el cuerpo de la respuesta
    let data;
    try {
      // Luego intentamos parsear como JSON
      data = response.data;
      logStep(9, "Datos de la respuesta (JSON)", data);
      
      // Verificar específicamente si tenemos un ID de usuario
      if (data?.user?.[0]?.id) {
        logStep('9.1', "ID de usuario encontrado:", data.user[0].id);
      } else {
        logStep('9.2', "No se encontró ID de usuario en la respuesta. Estructura de data:", JSON.stringify(data?.user));
      }
    } catch (error) {
      logStep(9, "Error al parsear la respuesta JSON", { error });
      data = { message: "Error al procesar la respuesta del servidor" };
    }

    if (!response.success) {
      logStep(10, "Error en la respuesta", { message: data?.message });
      return {
        success: false,
        message: data?.message || 'Error al registrar usuario',
      }
    }

    // Guardar el token en localStorage o cookies si es necesario
    if (data?.token) {
      logStep(11, "Guardando token", { token: data.token.substring(0, 10) + '...' });
      // Aquí podrías guardar el token en localStorage o cookies
    }

    // Verificar y asegurar que userData tenga una estructura válida
    // El usuario viene dentro de un array en data.user
    const userResult = Array.isArray(data?.user) && data?.user.length > 0 
      ? data.user[0] 
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
      token: data?.token,
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

    logStep(7, "Realizando petición a: /auth/register");
    
    // Imprimir el cuerpo de la petición exactamente como se enviará
    logStep('7.1', "Cuerpo de la petición (JSON)", userData);
    
    // Enviar los datos al endpoint de autenticación usando serverApi
    const response = await serverApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    logStep(8, `Respuesta recibida - Status: ${response.success ? 'success' : 'error'}`);
    logStep('8.1', "Datos de la respuesta", response.data);

    // Intentar obtener el cuerpo de la respuesta
    let data;
    try {
      // Luego intentamos parsear como JSON
      data = response.data;
      logStep(9, "Datos de la respuesta (JSON)", data);
    } catch (error) {
      logStep(9, "Error al parsear la respuesta JSON", { error });
      data = { message: "Error al procesar la respuesta del servidor" };
    }

    if (!response.success) {
      logStep(10, "Error en la respuesta", { message: data?.message });
      return {
        success: false,
        message: data?.message || 'Error al registrar usuario',
      }
    }

    // Guardar el token en localStorage o cookies si es necesario
    if (data?.token) {
      logStep(11, "Guardando token", { token: data.token.substring(0, 10) + '...' });
      // Aquí podrías guardar el token en localStorage o cookies
    }

    logStep(12, "Registro exitoso");
    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      token: data?.token,
      userData: data?.user
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