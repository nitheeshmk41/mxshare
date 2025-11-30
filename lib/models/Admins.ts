import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true }, // For credential login
    password: { type: String }, // Hashed password for credential login
    addedBy: { type: String, default: "System" },
  },
  { timestamps: true }
);

// Ensure super admin always exists
AdminSchema.post('init', async function(doc) {
  try {
    const superAdminEmail = "25mx336@psgtech.ac.in";
    const Admin = mongoose.model("Admins");
    const exists = await Admin.findOne({ email: superAdminEmail });
    if (!exists) {
      await Admin.create({ email: superAdminEmail, addedBy: "System" });
    }
  } catch (err) {
    console.error("Error ensuring super admin:", err);
  }
});

export default mongoose.models.Admins || mongoose.model("Admins", AdminSchema);
