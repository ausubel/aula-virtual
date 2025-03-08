'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart as BarChartIcon, BookOpen, Award, Users, TrendingUp, Clock, UserCheck, GraduationCap } from "lucide-react"
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { useState, useEffect } from "react"
import { DashboardMetrics, AdminService } from "@/services/admin.service"

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0,
    totalActiveCourses: 0,
    certificatesIssued: 0,
    completionRate: 0,
    averageHours: 0,
    activeStudents: 0,
    passRate: 0,
    graduatesThisYear: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      setIsLoading(true);
      const data = await AdminService.getDashboardMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      let errorMessage = 'Error al cargar las métricas. Por favor, inténtelo de nuevo más tarde.';
      if (err instanceof Error) {
        if (err.message.includes('No autorizado')) {
          errorMessage = 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.';
        } else if (err.message.includes('No se encontró el token')) {
          errorMessage = 'No se encontró la sesión. Por favor, inicie sesión.';
        }
      }
      setError(errorMessage);
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Función para formatear números
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Datos para el gráfico de barras de métricas principales
  const mainMetricsData = [
    { name: 'Estudiantes', value: metrics.totalStudents },
    { name: 'Cursos', value: metrics.totalActiveCourses },
    { name: 'Certificados', value: metrics.certificatesIssued },
    { name: 'Graduados', value: metrics.graduatesThisYear }
  ];

  // Datos para el gráfico de tasas
  const ratesData = [
    { name: 'Finalización', value: metrics.completionRate },
    { name: 'Aprobación', value: metrics.passRate }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Métricas Principales en Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(metrics.totalStudents)}</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-green-600">Total de estudiantes registrados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(metrics.totalActiveCourses)}</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-green-600">Cursos disponibles</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Certificados</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(metrics.certificatesIssued)}</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-green-600">Total certificados emitidos</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${metrics.completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Resumen */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mainMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasas (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Secundarias */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Promedio de Horas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageHours}h</div>
                <p className="text-xs text-muted-foreground mt-2">Por curso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(metrics.activeStudents)}</div>
                <p className="text-xs text-muted-foreground mt-2">Última semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.passRate}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${metrics.passRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Graduados</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(metrics.graduatesThisYear)}</div>
                <p className="text-xs text-muted-foreground mt-2">Este año</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
