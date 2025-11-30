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
    // comments subdocuments
    comments: [
      {
        author: { type: String, default: "Anonymous" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // who added the file
    author: { type: String, default: "Anonymous" },
    authorEmail: { type: String, default: "" },

    // ratings
    ratings: [
      {
        user: { type: String }, // email
        stars: { type: Number },
      },
    ],
    aiSummary: { type: String, default: "" },
    aiDescription: { type: String, default: "" },
    resourceLinks: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Files || mongoose.model("Files", FileSchema);
