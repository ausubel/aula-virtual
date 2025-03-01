'use server'

import { z } from 'zod'

// Schema de validación
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
})

export async function register(formData: FormData) {
  try {
    // Extraer y validar datos
    const validatedData = registerSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    })

    // Preparar datos para el backend
    const userData = {
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.firstName,
      surname: validatedData.lastName,
    }

    // Llamar al endpoint de registro
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/register/student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al registrar usuario',
      }
    }

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      }
    }

    console.error('Error en el registro:', error)
    return {
      success: false,
      message: 'Error interno del servidor',
    }
  }
} 