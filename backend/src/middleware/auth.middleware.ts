import {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";
import User, {
  UserRole,
} from "../models/User";

export interface AuthRequest
  extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
        role: UserRole;
        department?: string;
        designation?: string;
        lastLogin?: Date;
      };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header =
      req.headers.authorization;

    if (
      !header ||
      !header.startsWith("Bearer ")
    ) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token =
      header.substring(7);

    const secret =
      process.env.JWT_SECRET ||
      "POLICE_HQ_CHANGE_THIS_SECRET";

    const decoded =
      jwt.verify(token, secret) as {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        department?: string;
        designation?: string;
        lastLogin?: Date;
      };

    const user =
      await User.findById(decoded.id)
        .select("_id name email role department designation lastLogin isActive");

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "User session is invalid",
      });
      return;
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation,
      lastLogin: user.lastLogin,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export function requireRoles(
  ...roles: UserRole[]
) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
}





