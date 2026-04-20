import config from "../config";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";


async function seedAdmin() {
  try {

    const adminData = {
      name: config.admin_name!,
      email: config.admin_email!,
      role: UserRole.ADMIN,
      password: config.admin_password!,
    };

    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      return;
    }


    const signUpAdmin = await fetch(
      `${config.server_url}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Origin: config.app_url || "http://localhost:3000",
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
