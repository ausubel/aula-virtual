import Tokenizer from "./tokenizer";

function sendAuthResponse(res: any, statusCode: number, message: string) {
  return res.status(statusCode).json({
    message
  });
}

export function checkAuthToken(userRoleId: number) {
  return async (req, res, next) => {
    let token;
    
    // Intentar obtener el token del header de autorización
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.split("Bearer ")[1];
    }
    
    // Si no hay token en el header, intentar obtenerlo de las cookies
    if (!token && req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return sendAuthResponse(res, 401, "Authorization token is missing.");
    }

    try {
      await Tokenizer.check(token, { userRoleId });
      next();
    } catch (err) {
      return sendAuthResponse(res, 401, "Invalid or expired token.");
    }
  };
}