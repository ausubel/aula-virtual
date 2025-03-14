import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  id: number;
  email: string;
  roleId: number;
}

// Lista de rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/logout',
  '/force-logout',
  '/debug-logout',
  '/cookie-logout'
];

// Esta función se ejecutará solo en las rutas definidas en el matcher
export function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const path = request.nextUrl.pathname;
  
  // Si la ruta comienza con /certificates o /api, permitir acceso público
  if (path.startsWith('/certificates') || path.startsWith('/api')) {
    console.log('Acceso público permitido a ruta:', path);
    return NextResponse.next();
  }

  // Si la ruta es pública, permitir acceso
  if (publicRoutes.includes(path)) {
    console.log('Acceso público permitido a ruta:', path);
    return NextResponse.next();
  }
  
  const token = request.cookies.get('auth_token')?.value
  const url = request.nextUrl.clone()

  // Si no hay token, redirigir al login
  if (!token) {
    console.log('No hay token, redirigiendo al login desde:', path);
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Decodificar el token para obtener el rol
    const decoded = jwtDecode<DecodedToken>(token)
    const isAdmin = decoded.roleId === 1
    const isTeacher = decoded.roleId === 3
    const isStudent = decoded.roleId === 2

    // Rutas administrativas
    if (url.pathname.startsWith('/admin')) {
      if (!isAdmin) {
        // Si no es admin, redirigir a su dashboard correspondiente
        if (isStudent) {
          return NextResponse.redirect(new URL('/profile', request.url))
        } else if (isTeacher) {
          return NextResponse.redirect(new URL('/teacher', request.url))
        }
      }
      return NextResponse.next()
    }

    // Rutas de estudiante
    if (url.pathname.startsWith('/student')) {
      if (!isStudent) {
        // Si no es estudiante, redirigir a su dashboard correspondiente
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (isTeacher) {
          return NextResponse.redirect(new URL('/teacher', request.url))
        }
      }
      return NextResponse.next()
    }

    // Rutas de profesor
    if (url.pathname.startsWith('/teacher')) {
      if (!isTeacher) {
        // Si no es profesor, redirigir a su dashboard correspondiente
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (isStudent) {
          return NextResponse.redirect(new URL('/profile', request.url))
        }
      }
      return NextResponse.next()
    }

    // Rutas de perfil
    if (url.pathname.startsWith('/profile')) {
      if (!isStudent) {
        // Si no es estudiante, redirigir a su dashboard correspondiente
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (isTeacher) {
          return NextResponse.redirect(new URL('/teacher', request.url))
        }
      }
      return NextResponse.next()
    }

    // Rutas de dashboard
    if (url.pathname.startsWith('/dashboard')) {
      return NextResponse.next()
    }

    // Si el usuario ya está autenticado y trata de acceder a una ruta pública, redirigirlo según su rol
    // Excepto para la página principal, que siempre debe ser accesible
    if (publicRoutes.includes(url.pathname) && url.pathname !== '/') {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (isTeacher) {
        return NextResponse.redirect(new URL('/teacher', request.url))
      } else if (isStudent) {
        return NextResponse.redirect(new URL('/profile', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Si hay un error al decodificar el token, redirigir al login
    console.error('Error decodificando token:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Definir explícitamente las rutas que requieren autenticación
// IMPORTANTE: No incluir rutas públicas aquí
export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/profile/:path*',
    '/dashboard/:path*'
  ]
}
