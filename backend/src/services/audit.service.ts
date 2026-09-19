import AuditLog from "../models/AuditLog";

export async function createAuditLog(data: {
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  action: string;
  module: string;
  method?: string;
  endpoint?: string;
  targetId?: string;
  description?: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
  }
}
