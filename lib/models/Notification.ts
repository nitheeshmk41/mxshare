import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipientEmail: { type: String, required: true }, // Email is easier to track with NextAuth
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "error", "success"], default: "info" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
