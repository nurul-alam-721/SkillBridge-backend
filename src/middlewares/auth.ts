import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth'

export enum UserRole {
    STUDENT = "STUDENT",
    TUTOR = "TUTOR",
    ADMIN = "ADMIN",
}


const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionToken =
                req.cookies?.["__Secure-session-token"] ||
                req.cookies?.["session-token"];

            const headers = new Headers();
            
            if (sessionToken) {
                headers.set("cookie", `session-token=${sessionToken}`);
            } else {
                Object.entries(req.headers).forEach(([key, value]) => {
                    if (value) headers.set(key, Array.isArray(value) ? value.join(",") : value);
                });
            }

            const session = await betterAuth.api.getSession({ headers });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!"
                });
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified
            };

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resource!"
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    }
};

export default auth;