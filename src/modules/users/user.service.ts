import { prisma } from "../../lib/prisma";
import { UserRole } from "../../types";
import { UpdateOwnProfilePayload } from "../../interfaces";

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

const getById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateStatus = async (userId: string, data: any) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
};

export const userService = {
  getAllUsers,
  getById,
  updateOwnProfile,
  updateMyRole,
  updateStatus,
};