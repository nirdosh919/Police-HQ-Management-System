import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
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
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: String,
    userName: String,
    userEmail: String,
    role: String,
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    method: String,
    endpoint: String,
    targetId: String,
    description: String,
    statusCode: Number,
    ipAddress: String,
    userAgent: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
