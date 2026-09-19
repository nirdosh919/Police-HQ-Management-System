import mongoose, { Document, Schema } from "mongoose";

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Leave";

export interface IAttendance extends Document {
  officerId: mongoose.Types.ObjectId;
  employeeId: string;
  officerName: string;
  department?: string;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  markedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    officerId: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
      index: true,
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    officerName: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      required: true,
      index: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    markedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index(
  { officerId: 1, date: 1 },
  { unique: true }
);

AttendanceSchema.index({
  date: -1,
  status: 1,
});

export default mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema
);
