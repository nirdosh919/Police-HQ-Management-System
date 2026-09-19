import mongoose, { Document, Schema } from "mongoose";

export interface IPoliceStation extends Document {
  name: string;
  code: string;
  state?: string;
  district?: string;
  headquarters?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  officerInCharge?: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const policeStationSchema = new Schema<IPoliceStation>(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true, index: true },
    headquarters: { type: String, trim: true, index: true },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    officerInCharge: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true }
  },
  { timestamps: true }
);

export default mongoose.model<IPoliceStation>("PoliceStation", policeStationSchema);
