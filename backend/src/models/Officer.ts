import mongoose, { Document, Schema } from "mongoose";

export interface ITransfer {
  fromPosting: string;
  toPosting: string;
  date: Date;
  orderNumber?: string;
  remarks?: string;
}

export interface IPromotion {
  rank: string;
  date: Date;
  orderNumber?: string;
  remarks?: string;
}

export interface IOfficer extends Document {
  fullName: string;
  photograph?: string;
  rank: string;
  beltNumber?: string;
  employeeId: string;
  department: string;
  designation?: string;
  headquarters?: string;
  district?: string;
  state?: string;
  mobileNumber?: string;
  officialEmail?: string;
  dateOfBirth?: Date;
  dateOfJoining?: Date;
  promotionHistory: IPromotion[];
  transferHistory: ITransfer[];
  currentPosting?: string;
  previousPosting?: string;
  serviceStatus: "Active" | "Suspended" | "Retired";
  bloodGroup?: string;
  emergencyContact?: string;
  address?: string;
  documents: string[];
  gender?: "Male" | "Female" | "Other";
  createdAt: Date;
  updatedAt: Date;
}


const transferSchema = new Schema<ITransfer>(
  {
    fromPosting: {
      type: String,
      trim: true,
      default: ""
    },
    toPosting: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    orderNumber: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);
const promotionSchema = new Schema<IPromotion>(
  {
    rank: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    orderNumber: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const officerSchema = new Schema<IOfficer>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    photograph: {
      type: String,
      default: ""
    },

    rank: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    beltNumber: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      sparse: true
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },

    department: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    designation: {
      type: String,
      trim: true
    },

    headquarters: {
      type: String,
      trim: true,
      index: true
    },

    district: {
      type: String,
      trim: true,
      index: true
    },

    state: {
      type: String,
      trim: true,
      index: true
    },

    mobileNumber: {
      type: String,
      trim: true,
      index: true
    },

    officialEmail: {
      type: String,
      trim: true,
      lowercase: true
    },

    dateOfBirth: Date,

    dateOfJoining: {
      type: Date,
      index: true
    },

    transferHistory: {
      type: [transferSchema],
      default: []
    },

    promotionHistory: {
      type: [promotionSchema],
      default: []
    },

    currentPosting: {
      type: String,
      trim: true
    },

    previousPosting: {
      type: String,
      trim: true
    },

    serviceStatus: {
      type: String,
      enum: ["Active", "Suspended", "Retired"],
      default: "Active",
      index: true
    },

    bloodGroup: {
      type: String,
      trim: true
    },

    emergencyContact: {
      type: String,
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    documents: {
      type: [String],
      default: []
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    }
  },
  {
    timestamps: true
  }
);

officerSchema.index({
  fullName: "text",
  employeeId: "text",
  beltNumber: "text",
  department: "text",
  district: "text",
  headquarters: "text",
  rank: "text"
});

const Officer = mongoose.model<IOfficer>("Officer", officerSchema);

export default Officer;

