import mongoose from "mongoose";
const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    permissions: {
      type: [String],
      default: ["manageUsers", "manageProducts", "manageOrders", "viewReports"],
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
