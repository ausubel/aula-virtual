"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DebugLogout() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Función para añadir un mensaje de log
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substring(11, 23)}: ${message}`]);
  };

  useEffect(() => {
    // Registrar información inicial
    addLog("Página de depuración cargada");
    
    try {
      const currentToken = localStorage.getItem('authToken');
      setToken(currentToken);
      addLog(`Token actual: ${currentToken ? 'Existe' : 'No existe'}`);
    } catch (error) {
      addLog(`Error al obtener token: ${error}`);
    }
  }, []);

  // Función para probar la eliminación del token
  const testRemoveToken = () => {
    try {
      addLog("Intentando eliminar token...");
      localStorage.removeItem('authToken');
      const afterToken = localStorage.getItem('authToken');
      addLog(`Token después de eliminar: ${afterToken ? 'Aún existe' : 'Eliminado correctamente'}`);
      setToken(afterToken);
    } catch (error) {
      addLog(`Error al eliminar token: ${error}`);
    }
  };

  // Función para probar la redirección
  const testRedirect = () => {
    try {
      addLog("Intentando redireccionar a /login...");
      setRedirectAttempted(true);
      
      // Usar setTimeout para dar tiempo a que se registre el log
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      addLog(`Error al redireccionar: ${error}`);
    }
  };

  // Función para probar la redirección con replace
  const testRedirectReplace = () => {
    try {
      addLog("Intentando redireccionar con replace a /login...");
      setRedirectAttempted(true);
      
      // Usar setTimeout para dar tiempo a que se registre el log
      setTimeout(() => {
        window.location.replace("/login");
      }, 1000);
    } catch (error) {
      addLog(`Error al redireccionar con replace: ${error}`);
    }
  };

  // Función para probar el cierre de sesión completo
  const testFullLogout = () => {
    try {
      addLog("Iniciando proceso completo de cierre de sesión...");
      
      // Eliminar token
      localStorage.removeItem('authToken');
      const afterToken = localStorage.getItem('authToken');
      addLog(`Token después de eliminar: ${afterToken ? 'Aún existe' : 'Eliminado correctamente'}`);
      
      // Verificar si hay algún middleware o interceptor que esté redirigiendo
      addLog("Verificando redirecciones...");
      
      // Intentar redireccionar después de un breve retraso
      setRedirectAttempted(true);
      setTimeout(() => {
        addLog("Ejecutando redirección a /login");
        window.location.replace("/login");
      }, 2000);
    } catch (error) {
      addLog(`Error en proceso completo: ${error}`);
    }
  };

  // Función para verificar si hay algún middleware o interceptor
  const checkMiddleware = () => {
    try {
      addLog("Verificando posibles interceptores o middleware...");
      
      // Verificar si hay algún evento de beforeunload registrado
      if (window.onbeforeunload) {
        addLog("Se detectó un evento beforeunload");
      } else {
        addLog("No se detectó evento beforeunload");
      }
      
      // Verificar si hay algún service worker registrado
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          addLog(`Service workers registrados: ${registrations.length}`);
        });
      } else {
        addLog("Service Worker no soportado");
      }
      
      // Verificar localStorage
      const storageSize = Object.keys(localStorage).length;
      addLog(`Items en localStorage: ${storageSize}`);
      
      // Listar todas las claves en localStorage
      const keys = Object.keys(localStorage);
      addLog(`Claves en localStorage: ${keys.join(', ')}`);
    } catch (error) {
      addLog(`Error al verificar middleware: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Depuración de Cierre de Sesión</h1>
      
      <div className="bg-gray-100 p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Estado Actual</h2>
        <p><strong>Token:</strong> {token ? 'Existe' : 'No existe'}</p>
        <p><strong>Redirección intentada:</strong> {redirectAttempted ? 'Sí' : 'No'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={testRemoveToken}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
        >
          Probar Eliminar Token
        </button>
        
        <button 
          onClick={testRedirect}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded"
        >
          Probar Redirección
        </button>
        
        <button 
          onClick={testRedirectReplace}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded"
        >
          Probar Redirección (replace)
        </button>
        
        <button 
          onClick={testFullLogout}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
        >
          Probar Cierre de Sesión Completo
        </button>
        
        <button 
          onClick={checkMiddleware}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded"
        >
          Verificar Middleware/Interceptores
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Registros</h2>
        <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Link href="/admin" className="text-blue-600 hover:underline">
          Volver al Panel de Administración
        </Link>
        <Link href="/test-logout" className="text-blue-600 hover:underline">
          Ir a Página de Prueba de Logout
        </Link>
      </div>
    </div>
  );
}
