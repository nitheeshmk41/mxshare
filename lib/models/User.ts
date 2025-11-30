import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  role: { type: String, default: "user" },
  warnings: { type: Number, default: 0 },
  blockedUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
