// Servicio de autenticación para manejar tokens y sesiones
import Cookies from 'js-cookie';

// Función para guardar el token en localStorage y cookies
export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    // También guardamos el token en una cookie para que el middleware pueda acceder a él
    Cookies.set('auth_token', token, { expires: 7 }); // Expira en 7 días
  }
};

// Función para guardar la información de CV
export const saveUserCVStatus = (hasCV: boolean) => {
  if (typeof window !== 'undefined') {
    Cookies.set('has_uploaded_cv', hasCV ? 'true' : 'false', { expires: 7 });
  }
};

// Función para guardar el rol del usuario
export const saveUserRole = (role: number) => {
  if (typeof window !== 'undefined') {
    Cookies.set('user_role', role.toString(), { expires: 7 });
  }
};

// Función para guardar el ID del usuario
export const saveUserId = (id: number) => {
  if (typeof window !== 'undefined') {
    Cookies.set('user_id', id.toString(), { expires: 7 });
  }
};

// Función para obtener el token de localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || Cookies.get('auth_token') || null;
  }
  return null;
};

// Función para eliminar el token (logout)
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    // Eliminar del localStorage
    localStorage.removeItem('authToken');
    localStorage.clear();
    
    Cookies.remove('auth_token');
    Cookies.remove('has_uploaded_cv');
    Cookies.remove('user_role');
    Cookies.remove('user_id');
    
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Función para obtener los headers de autenticación
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Función para realizar el logout
export const logout = () => {
  removeToken();
  // Aquí puedes agregar cualquier otra lógica de limpieza necesaria
};

// Función para decodificar el token JWT (básica)
export const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Función para obtener el rol del usuario desde el token
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.userRoleId || null;
};

// Función para obtener el ID del usuario desde el token
export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  console.log('Getting user ID from token:', decoded);
  return decoded?.userId || null;
};

// Función para verificar si el usuario ha subido su CV
export const hasUploadedCV = (): boolean => {
  return Cookies.get('has_uploaded_cv') === 'true';
};

// Función para marcar que el usuario ha subido su CV
export const markCVAsUploaded = () => {
  Cookies.set('has_uploaded_cv', 'true', { expires: 30 }); // Expira en 30 días
};
