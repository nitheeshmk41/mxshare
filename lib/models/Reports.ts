import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "Files", required: true },
    reporter: { type: String, required: true }, // email
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Reports || mongoose.model("Reports", ReportSchema);
