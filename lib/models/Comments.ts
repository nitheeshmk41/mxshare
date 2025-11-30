import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true, index: true },
    author: { type: String, default: "Anonymous" },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.FileComments || mongoose.model("FileComments", CommentSchema);
