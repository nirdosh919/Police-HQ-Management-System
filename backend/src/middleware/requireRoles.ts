import { Request, Response, NextFunction } from "express";

export type AppRole = "Super Admin" | "Admin" | "Officer/Viewer";

export function requireRoles(...allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const role = user.role || user.designation;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}
