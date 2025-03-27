'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BellIcon, LockIcon, UserIcon, MailIcon, GlobeIcon, LoaderIcon, FileTextIcon, DownloadIcon } from "lucide-react"
import withCVRequired from "@/components/auth/with-cv-required"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import Swal from "sweetalert2"
import userService from "@/services/user.service"
import { Separator } from "@/components/ui/separator"
import "./styles.css"
import apiClient from "@/lib/api-client"

// Tipo para los datos del usuario
interface UserData {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

// Tipo para datos de cambio de contraseña
interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function SettingsPage() {
  const [userData, setUserData] = useState<UserData>({
    id: 0,
    name: "",
    surname: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    getUserData();
  }, []);

  // Función para obtener los datos del usuario
  const getUserData = async () => {
    try {
      setLoading(true);
      const id = Number(Cookies.get('user_id'));

      // Obtener datos básicos del perfil
      const response = await apiClient.get(`/user/student/${id}/profile`);

      if (response.data && response.data.data) {
        const profileData = response.data.data;

        // Obtener datos adicionales del perfil (ubicación y biografía)
        try {
          const profileDataAdditional = await userService.getStudentProfileData(id);
          if (profileDataAdditional && profileDataAdditional.data) {
            profileData.location = profileDataAdditional.data.location || "";
            profileData.bio = profileDataAdditional.data.bio || "";
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }

        setUserData({
          id: profileData.id,
          name: profileData.name || "",
          surname: profileData.surname || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || ""
        });
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la información del perfil
  const updateProfileInfo = async () => {
    try {
      // Validar la longitud de la biografía
      if (userData.bio && userData.bio.length > 500) {
        toast({
          title: "Error",
          description: "La biografía no debe exceder los 500 caracteres",
          variant: "destructive"
        });
        return;
      }

      setSaving(true);
      // Mostrar indicador de carga

      const response = await userService.updateStudentProfileInfo(
        userData.id,
        userData.name,
        userData.surname,
        userData.phone,
        userData.location,
        userData.bio
      );
      // Verificar si la respuesta contiene un mensaje de éxito
      if (response && response.message === "Perfil actualizado correctamente") {
        // Mostrar mensaje de éxito con SweetAlert
        Swal.fire({
          title: "¡Perfil actualizado!",
          text: "Tu información de perfil ha sido actualizada correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
          timer: 3000,
          timerProgressBar: true,
          position: 'center',
          showConfirmButton: true
        });

        // Recargar los datos del perfil para mostrar la información actualizada
        getUserData();
      }
    } catch (error) {
      console.error("Error updating profile info:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar la información del perfil. Inténtalo de nuevo más tarde.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
        position: 'center',
        showConfirmButton: true
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para cambiar la contraseña
  const changePassword = async () => {
    try {
      // Validar que las contraseñas coincidan
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas nuevas no coinciden",
          variant: "destructive"
        });
        return;
      }

      // Validar que la contraseña tenga al menos 8 caracteres
      if (passwordData.newPassword.length < 8) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 8 caracteres",
          variant: "destructive"
        });
        return;
      }

      setChangingPassword(true);
      // Mostrar indicador de carga

      // Llamar al endpoint para cambiar la contraseña
      const response = await apiClient.put(`/user/student/${userData.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.status === 200) {
        // Limpiar los campos de contraseña
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });

        // Cerrar indicador de carga y mostrar éxito
        Swal.fire({
          title: "Contraseña actualizada",
          text: "Tu contraseña ha sido actualizada correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
          timer: 3000,
          timerProgressBar: true,
          position: 'center',
          showConfirmButton: true
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);

      // Mostrar mensaje específico si la contraseña actual es incorrecta
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Error",
          text: "La contraseña actual es incorrecta",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
          timer: 3000,
          timerProgressBar: true,
          position: 'center',
          showConfirmButton: true
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar la contraseña. Inténtalo de nuevo más tarde.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
          timer: 3000,
          timerProgressBar: true,
          position: 'center',
          showConfirmButton: true
        });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Manejar cambios en los campos de perfil
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="settings-page space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        
        <TabsContent value="account" className="space-y-4">
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="card-title gap-4">Información de Perfil</CardTitle>
              <CardDescription className="card-description gap-4">
                Actualiza tu información personal y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Cargando información...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        name="name"
                        value={userData.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Apellido</Label>
                      <Input
                        id="surname"
                        name="surname"
                        value={userData.surname}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userData.email}
                        onChange={handleProfileChange}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={userData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        name="location"
                        value={userData.location}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={userData.bio}
                      onChange={handleProfileChange}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {userData.bio ? userData.bio.length : 0}/500 caracteres
                    </p>
                  </div>
                  <div className="save-button-container">
                    <Button
                      onClick={updateProfileInfo}
                      disabled={saving}
                      className="save-button"
                    >
                      {saving ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default withCVRequired(SettingsPage)