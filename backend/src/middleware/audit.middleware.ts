import { Request, Response, NextFunction } from "express";
import { createAuditLog } from "../services/audit.service";

function getModule(req: Request) {
  const path = req.originalUrl.toLowerCase();

  if (path.includes("officer")) return "Officers";
  if (path.includes("transfer") || path.includes("promotion")) return "Transfers & Promotions";
  if (path.includes("report")) return "Reports";
  if (path.includes("admin")) return "Admin";
  if (path.includes("attendance")) return "Attendance";
  if (path.includes("department")) return "Departments";
  if (path.includes("headquarter")) return "Headquarters";
  if (path.includes("police-station")) return "Police Stations";
  return "System";
}

function getAction(method: string) {
  switch (method.toUpperCase()) {
    case "POST":
      return "Created";
    case "PUT":
      return "Updated";
    case "PATCH":
      return "Updated";
    case "DELETE":
      return "Deleted";
    default:
      return "Accessed";
  }
}

export function auditRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const method = req.method.toUpperCase();

  if (req.originalUrl.includes("/api/audit")) {
    return next();
  }

  // Reports GET requests are auditable.
  // Existing Officer GET behaviour remains unchanged because
  // auditRequest is not mounted on read-only Officer GET routes.

  const user = (req as any).user;

  if (!user) {
    return next();
  }

  res.on("finish", () => {
    if (res.statusCode >= 400) return;

    void createAuditLog({
      userId: user.id || user._id?.toString(),
      userName: user.name || user.fullName,
      userEmail: user.email || user.officialEmail,
      role: user.role || user.designation,
      action: getAction(method),
      module: getModule(req),
      method,
      endpoint: req.originalUrl,
      targetId: typeof req.params?.id === "string" ? req.params.id : typeof req.params?.officerId === "string" ? req.params.officerId : undefined,
      description:
        `${getAction(method)} ${getModule(req)} record`,
      statusCode: res.statusCode,
      ipAddress:
        req.ip ||
        req.socket.remoteAddress ||
        undefined,
      userAgent:
        req.get("user-agent") ||
        undefined,
    });
  });

  next();
}





