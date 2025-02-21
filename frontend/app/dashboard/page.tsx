'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/services/auth.service'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // Guardar el token en cookie
      AuthService.setToken(token)
      
      // Redirigir a la misma página sin el token en la URL
      router.push('/dashboard')
    } else if (!AuthService.isAuthenticated()) {
      // Si no hay token en la URL ni en las cookies, redirigir al login
      router.push('/login')
    }
  }, [searchParams, router])

  const handleLogout = () => {
    AuthService.removeToken()
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-lg">Bienvenido al dashboard</p>
        </div>
      </div>
    </div>
  )
}
