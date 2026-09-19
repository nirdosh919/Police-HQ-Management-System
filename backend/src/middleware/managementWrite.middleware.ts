import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function requireManagementWrite(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const method = req.method.toUpperCase();

  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    next();
    return;
  }

  if (
    req.user.role !== "Super Admin" &&
    req.user.role !== "Admin"
  ) {
    res.status(403).json({
      success: false,
      message: "View-only access. Management permission required.",
    });
    return;
  }

  next();
}
