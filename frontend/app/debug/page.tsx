'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const searchParams = useSearchParams()
  const [authStatus, setAuthStatus] = useState({
    tokenInCookie: false,
    tokenValue: '',
    tokenInUrl: false,
    tokenUrlValue: ''
  })
  
  useEffect(() => {
    const tokenInUrl = searchParams.get('token')
    const tokenInCookie = AuthService.getToken()
    
    setAuthStatus({
      tokenInCookie: !!tokenInCookie,
      tokenValue: tokenInCookie || 'No token in cookie',
      tokenInUrl: !!tokenInUrl,
      tokenUrlValue: tokenInUrl || 'No token in URL'
    })
  }, [searchParams])
  
  const handleSaveToken = () => {
    const tokenInUrl = searchParams.get('token')
    if (tokenInUrl) {
      AuthService.setToken(tokenInUrl)
      alert('Token guardado en cookie')
      window.location.reload()
    } else {
      alert('No hay token en la URL para guardar')
    }
  }
  
  const handleClearToken = () => {
    AuthService.removeToken()
    alert('Token eliminado')
    window.location.reload()
  }
  
  const handleRedirectToUploadCV = () => {
    const token = AuthService.getToken()
    if (token) {
      window.location.href = `/profile/upload-cv?token=${token}`
    } else {
      alert('No hay token para incluir en la redirección')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Página de Depuración</CardTitle>
          <CardDescription>Verifica el estado de la autenticación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Estado del Token</h3>
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>Token en Cookie:</strong> {authStatus.tokenInCookie ? 'Sí' : 'No'}</p>
              <p className="text-xs break-all"><strong>Valor:</strong> {authStatus.tokenValue}</p>
              <p><strong>Token en URL:</strong> {authStatus.tokenInUrl ? 'Sí' : 'No'}</p>
              <p className="text-xs break-all"><strong>Valor:</strong> {authStatus.tokenUrlValue}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSaveToken} disabled={!authStatus.tokenInUrl}>
              Guardar Token de URL en Cookie
            </Button>
            <Button onClick={handleClearToken} variant="destructive">
              Eliminar Token de Cookie
            </Button>
            <Button onClick={handleRedirectToUploadCV} disabled={!authStatus.tokenInCookie}>
              Ir a Subir CV con Token
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
