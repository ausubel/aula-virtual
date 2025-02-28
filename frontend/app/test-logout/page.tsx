"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestLogout() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Obtener el token actual
    const currentToken = localStorage.getItem('authToken');
    setToken(currentToken);
  }, []);

  function handleLogout1() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }

  function handleLogout2() {
    localStorage.removeItem('authToken');
    window.location.replace('/login');
  }

  function handleLogout3() {
    localStorage.clear();
    window.location.href = '/login';
  }

  function checkToken() {
    const currentToken = localStorage.getItem('authToken');
    setToken(currentToken);
    alert(`Token actual: ${currentToken || 'No hay token'}`);
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Página de Prueba de Cierre de Sesión</h1>
      
      <div className="bg-gray-100 p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Estado Actual</h2>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No hay token'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={handleLogout1}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
        >
          Cerrar Sesión (location.href)
        </button>
        
        <button 
          onClick={handleLogout2}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
        >
          Cerrar Sesión (location.replace)
        </button>
        
        <button 
          onClick={handleLogout3}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
        >
          Cerrar Sesión (localStorage.clear)
        </button>
        
        <button 
          onClick={checkToken}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
        >
          Verificar Token
        </button>
      </div>
      
      <div className="mt-8">
        <Link href="/admin" className="text-blue-600 hover:underline">
          Volver al Panel de Administración
        </Link>
      </div>
    </div>
  );
}
