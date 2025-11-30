import { NextResponse } from "next/server";
import db from "@/lib/db";
import Admins from "@/lib/models/Admins";

export async function POST() {
  try {
    await db();
    
    const superAdminEmail = "25mx336@psgtech.ac.in";
    const superAdminUsername = "mxadmin";
    const superAdminPassword = "admin123"; // Plain text for now
    
    const exists = await Admins.findOne({ email: superAdminEmail });
    
    if (!exists) {
      await Admins.create({
        email: superAdminEmail,
        username: superAdminUsername,
        password: superAdminPassword,
        addedBy: "System",
      });
      return NextResponse.json({ 
        success: true, 
        message: "Super admin created",
        credentials: { username: superAdminUsername, password: superAdminPassword }
      });
    } else {
      // Update existing admin with username/password if not present
      if (!exists.username || !exists.password) {
        exists.username = superAdminUsername;
        exists.password = superAdminPassword;
        await exists.save();
        return NextResponse.json({ 
          success: true, 
          message: "Super admin updated with credentials",
          credentials: { username: superAdminUsername, password: superAdminPassword }
        });
      } else {
        return NextResponse.json({ 
          success: true, 
          message: "Super admin already exists with credentials",
          credentials: { username: exists.username }
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
