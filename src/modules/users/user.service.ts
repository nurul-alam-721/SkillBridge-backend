import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

type UpdateOwnProfilePayload = {
  name?: string;
  phone?: string;
  image?: string;
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const updateMyRole = async (userId: string, role: UserRole) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
};

const updateOwnProfile = async (
  userId: string,
  payload: UpdateOwnProfilePayload,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

export const userService = {
  getAllUsers,
  updateOwnProfile,
  updateMyRole,
};