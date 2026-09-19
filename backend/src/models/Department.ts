import mongoose, { Document, Schema } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  head?: string;
  headquarters?: string;
  contactNumber?: string;
  email?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  head: { type: String, trim: true },
  headquarters: { type: String, trim: true },
  contactNumber: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

export default mongoose.model<IDepartment>("Department", departmentSchema);
