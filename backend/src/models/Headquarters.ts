import mongoose, { Document, Schema } from "mongoose";

export interface IHeadquarters extends Document {
  name: string;
  code: string;
  state?: string;
  district?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const headquartersSchema = new Schema<IHeadquarters>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Headquarters = mongoose.model<IHeadquarters>(
  "Headquarters",
  headquartersSchema
);

export default Headquarters;
