"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasUploadedCV, getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpIcon } from "lucide-react";

interface WithCVRequiredProps {
  children: React.ReactNode;
}

export default function withCVRequired<P extends object>(Component: React.ComponentType<P>) {
  const WithCVRequiredComponent = (props: P) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [hasCV, setHasCV] = useState(true);
    const userRole = getUserRole();

    useEffect(() => {
      // Solo aplicar esta restricción a estudiantes (asumiendo que el rol de estudiante es 2)
      if (userRole !== 2) {
        setIsLoading(false);
        return;
      }

      // Verificar si el usuario ha subido su CV
      const cvUploaded = hasUploadedCV();
      setHasCV(cvUploaded);
      setIsLoading(false);
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Si el usuario no es estudiante o ya ha subido su CV, mostrar el componente normalmente
    if (userRole !== 2 || hasCV) {
      return <Component {...props} />;
    }

    // Si el usuario es estudiante y no ha subido su CV, mostrar mensaje
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">CV requerido</CardTitle>
            <CardDescription>
              Necesitas subir tu CV antes de acceder a esta sección
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <FileUpIcon className="h-12 w-12 text-primary" />
            </div>
            <p className="text-center text-muted-foreground">
              Para acceder a todas las funcionalidades de la plataforma, primero debes completar tu perfil subiendo tu CV.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push("/profile/upload-cv")}
            >
              Subir mi CV ahora
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  WithCVRequiredComponent.displayName = `withCVRequired(${Component.displayName || Component.name || 'Component'})`;
  
  return WithCVRequiredComponent;
}
