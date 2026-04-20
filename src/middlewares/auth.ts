import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth';
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../lib/prisma";


import { UserRole } from "../types";
export { UserRole };


const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, status: true },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account not found.",
        });
      }

      if (user.status === "BANNED") {
        return res.status(403).json({
          success: false,
          code: "ACCOUNT_BANNED",
          message: "Your account has been suspended. Please contact support if you believe this is a mistake.",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resource!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;