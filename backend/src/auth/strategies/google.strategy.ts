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

    const verifyCallback = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
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
                const user = req.user;
                const token = await Tokenizer.create({
                    userRoleId: user.roleId
                });
                
                // Redireccionar al frontend con el token
                res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
            } catch (error) {
                console.error("Error in callback route:", error);  // Para debugging
                sendResponses(res, 500, "Error during authentication");
            }
        }
    );
};
