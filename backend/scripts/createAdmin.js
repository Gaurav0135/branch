import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    // Admin credentials (change these as needed)
    const adminEmail = "admin@frameza.com";
    const adminPassword = "Admin@123456";
    const adminName = "Frameza Admin";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    // Hash password
    const hash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hash,
      role: "admin"
    });

    console.log("✓ Admin account created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("\nIMPORTANT: Save these credentials securely. Change the password after first login.");

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
