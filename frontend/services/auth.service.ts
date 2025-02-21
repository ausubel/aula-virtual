import Cookies from 'js-cookie';

export class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static COOKIE_OPTIONS = {
    expires: 7, // 7 días
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
  };

  static setToken(token: string) {
    // Guardar en cookie
    Cookies.set(this.TOKEN_KEY, token, this.COOKIE_OPTIONS);
  }

  static getToken(): string | undefined {
    return Cookies.get(this.TOKEN_KEY);
  }

  static removeToken() {
    Cookies.remove(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
