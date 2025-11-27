import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, default: "" },
    semester: { type: String, default: "" },
    hints: { type: String, default: "" },

    driveUrl: { type: String, required: true },

    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Files || mongoose.model("Files", FileSchema);
