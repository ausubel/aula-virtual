import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  id: number;
  email: string;
  roleId: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const url = request.nextUrl.clone()

  // Si no hay token y la ruta es protegida, redirigir al login
  if (!token) {
    if (isProtectedRoute(url.pathname)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
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
          return NextResponse.redirect(new URL('/courses', request.url))
        } else if (isTeacher) {
          return NextResponse.redirect(new URL('/teacher', request.url))
        }
      }
      return NextResponse.next()
    }

    // Rutas de estudiante
    if (url.pathname.startsWith('/courses')) {
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
          return NextResponse.redirect(new URL('/courses', request.url))
        }
      }
      return NextResponse.next()
    }

    // Redirigir desde la raíz o login según el rol
    if (url.pathname === '/' || url.pathname === '/login') {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (isTeacher) {
        return NextResponse.redirect(new URL('/teacher', request.url))
      } else if (isStudent) {
        return NextResponse.redirect(new URL('/courses', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Si hay un error al decodificar el token, redirigir al login
    console.error('Error decodificando token:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/admin',
    '/student',
    '/teacher',
    '/profile',
    '/dashboard'
  ]
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/login'
  ]
}
