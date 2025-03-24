import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PassportStatic } from 'passport';
import AuthService from '../../services/auth.service';
import { Router } from 'express';
import { sendResponses } from '../../utils/sendResponses';
import Tokenizer from '../../utils/tokenizer';
import User from '../../entities/User';

export const setupGoogleStrategy = (app: Router, passport: PassportStatic) => {
    const authService = new AuthService();

    const strategyOptions = {
        clientID: process.env.AUTH_GOOGLE_CLIENT_ID!,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.AUTH_GOOGLE_CALLBACK,
        scope: ['profile', 'email']
    };

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user: User, done) => {
        done(null, user);
    });

    const verifyCallback = async (profile: any, done: any) => {
        try {
            console.log("Profile from Google:", profile);  // Para debugging
            const user = await authService.getOrCreateGoogleUser({
                emails: [{ value: profile.emails[0].value }],
                name: {
                    givenName: profile.name.givenName,
                    familyName: profile.name.familyName
                }
            });
            done(null, user);
        } catch (error) {
            console.error("Error in verify callback:", error);  // Para debugging
            done(error, null);
        }
    };

    passport.use(new GoogleStrategy(strategyOptions, verifyCallback));

    // Ruta de inicio de sesión con Google
    app.get('/google/login', 
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })
    );

    // Callback después de la autenticación de Google
    app.get('/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        async (req: any, res) => {
            try {
                const user = req.user[0];
                console.log("User authenticated:", user);  // Log del usuario autenticado
                
                const token = await Tokenizer.create({
                    userRoleId: user.roleId,
                    userId: user.id
                });
                console.log("Token created:", token);  // Log del token creado
                
                // Establecer el token como cookie
                res.cookie('auth_token', token, {
                    httpOnly: false, // Cambiar a false para que sea accesible desde JavaScript
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    path: '/',
                    sameSite: 'lax'
                });
                
                // Establecer cookie para indicar si el usuario ha subido su CV
                res.cookie('has_uploaded_cv', user.hasCV ? 'true' : 'false', {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
                    path: '/',
                    sameSite: 'lax'
                });

                res.cookie('user_id', user.id, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    path: '/',
                    sameSite: 'lax'
                });
                
                
                res.cookie('user_role', user.roleId, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    path: '/',
                    sameSite: 'lax'
                });
                
                // Redirigir según si el usuario tiene CV o no
                if (user.hasCV) {
                    // Si el usuario ya tiene CV, redirigir a la página según el rol
                    if (user.roleId === 2) { // Si es estudiante
                        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/profile`);
                    } else if (user.roleId === 3) { // Si es profesor
                        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/teacher`);
                    } else if (user.roleId === 1) { // Si es admin
                        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin`);
                    } else {
                        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/profile`);
                    }
                } else {
                    // Si el usuario no tiene CV, redirigir a la página de subida de CV
                    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/profile/upload-cv`);
                }
            } catch (error) {
                console.error("Error in callback route:", error);  // Para debugging
                sendResponses(res, 500, "Error during authentication");
            }
        }
    );
};
