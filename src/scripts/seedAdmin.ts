import "dotenv/config";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";


async function seedAdmin() {
  try {

    const adminData = {
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL || "admin@admin.com",
      role: UserRole.ADMIN,
      password: process.env.ADMIN_PASSWORD,
    };

    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      return;
    }


    const signUpAdmin = await fetch(
      `${process.env.SERVER_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Origin: process.env.APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      }
    );

    if (!signUpAdmin.ok) {
      const errorText = await signUpAdmin.text();
      throw new Error(`Sign up failed: ${signUpAdmin.status} - ${errorText}`);
    }

    await signUpAdmin.json();

    await prisma.user.update({
      where: { email: adminData.email },
      data: { emailVerified: true },
    });

  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
