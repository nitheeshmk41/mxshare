import db from "../lib/db";
import Admins from "../lib/models/Admins";

async function seedSuperAdmin() {
  try {
    await db();
    
    const superAdminEmail = "25mx336@psgtech.ac.in";
    const superAdminUsername = "mxadmin";
    const superAdminPassword = "admin123"; // Plain text for now, will be hashed in production
    
    const exists = await Admins.findOne({ email: superAdminEmail });
    
    if (!exists) {
      await Admins.create({
        email: superAdminEmail,
        username: superAdminUsername,
        password: superAdminPassword,
        addedBy: "System",
      });
      console.log("✅ Super admin created:");
      console.log("   Email:", superAdminEmail);
      console.log("   Username:", superAdminUsername);
      console.log("   Password:", superAdminPassword);
    } else {
      // Update existing admin with username/password if not present
      if (!exists.username || !exists.password) {
        exists.username = superAdminUsername;
        exists.password = superAdminPassword;
        await exists.save();
        console.log("✅ Super admin updated with credentials:");
        console.log("   Email:", superAdminEmail);
        console.log("   Username:", superAdminUsername);
        console.log("   Password:", superAdminPassword);
      } else {
        console.log("✅ Super admin already exists with credentials");
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding super admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
