import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtener el token del localStorage no es posible en el middleware
  // porque se ejecuta en el servidor, así que verificamos la cookie
  const token = request.cookies.get('auth_token')
  
  // Verificar si hay un token en la URL (para el caso de redirección después de autenticación)
  const url = request.nextUrl.clone()
  const tokenInUrl = url.searchParams.get('token')
  
  // Si hay un token en la URL, permitir el acceso sin verificar la cookie
  if (tokenInUrl && (url.pathname.startsWith('/profile') || url.pathname.startsWith('/debug'))) {
    return NextResponse.next()
  }

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/profile', '/student']

  // Verificar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar si es una ruta de cierre de sesión
  const isLogoutRoute = ['/logout', '/force-logout', '/debug-logout', '/test-logout', '/cookie-logout'].some(route => 
    request.nextUrl.pathname === route
  )

  // Si es una ruta de cierre de sesión, permitir el acceso sin redirigir
  if (isLogoutRoute) {
    return NextResponse.next()
  }

  // Verificar si es la página de subida de CV
  const isUploadCVPage = request.nextUrl.pathname === '/profile/upload-cv'
  
  // Permitir acceso a la página de subida de CV si hay token
  if (isUploadCVPage && token) {
    return NextResponse.next()
  }

  // Verificar si el usuario está intentando acceder a la página de estudiante
  if (token && request.nextUrl.pathname.startsWith('/student')) {
    // Obtener el valor de la cookie que indica si el usuario ha subido su CV
    const hasUploadedCV = request.cookies.get('has_uploaded_cv')
    
    // Si el usuario no ha subido su CV, redirigir a la página de subida
    // Pero solo si no viene de la página de subida de CV para evitar bucles
    if (!hasUploadedCV || hasUploadedCV.value !== 'true') {
      const referer = request.headers.get('referer') || ''
      const isFromUploadCV = referer.includes('/profile/upload-cv')
      
      if (!isFromUploadCV) {
        console.log('Usuario sin CV, redirigiendo a página de subida')
        return NextResponse.redirect(new URL('/profile/upload-cv', request.url))
      }
    }
  }

  // Si hay un token y el usuario intenta acceder al login, redirigir al dashboard de estudiante
  // Pero NO redirigir si viene de una página de logout
  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')) {
    const referer = request.headers.get('referer') || ''
    const isFromLogout = ['/logout', '/force-logout', '/debug-logout', '/test-logout', '/cookie-logout'].some(route => 
      referer.includes(route)
    )
    
    if (!isFromLogout) {
      return NextResponse.redirect(new URL('/student', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/student/:path*',
    '/login',
    '/logout',
    '/force-logout',
    '/debug-logout',
    '/test-logout',
    '/cookie-logout',
    '/debug'
  ]
}
