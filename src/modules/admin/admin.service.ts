import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../types";

const getStats = async () => {
  const [
    totalStudents,
    totalTutors,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalCategories,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.category.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        student: {
          select: { name: true, image: true },
        },
        tutorProfile: {
          select: {
            hourlyRate: true,
            user: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
        slot: {
          select: { startTime: true, endTime: true },
        },
      },
    }),
  ]);

  let totalRevenue = 0;
  const batchSize = 200;
  let skip = 0;

  while (true) {
    const bookings = await prisma.booking.findMany({
      where: { status: "COMPLETED" },
      skip,
      take: batchSize,
      select: {
        tutorProfile: { select: { hourlyRate: true } },
        slot: { select: { startTime: true, endTime: true } },
      },
    });

    if (bookings.length === 0) break;

    for (const booking of bookings) {
      const start = new Date(booking.slot.startTime).getTime();
      const end = new Date(booking.slot.endTime).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      totalRevenue += booking.tutorProfile.hourlyRate * hours;
    }

    skip += batchSize;
  }

  return {
    totalStudents,
    totalTutors,
    totalUsers: totalStudents + totalTutors,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalCategories,
    totalRevenue: Math.round(totalRevenue),
    recentActivity: recentBookings,
  };
};

const getAllBookings = async (page = 1, limit = 20) => {
  return await prisma.booking.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      student: {
        select: { id: true, name: true, email: true, image: true },
      },
      tutorProfile: {
        select: {
          user: { select: { name: true, email: true } },
          category: { select: { name: true } },
          hourlyRate: true,
        },
      },
      slot: { select: { startTime: true, endTime: true } },
    },
  });
};

const getAllUsers = async (page = 1, limit = 20) => {
  return await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

const updateUserStatus = async (id: string, status: UserStatus) => {
  return prisma.user.update({
    where: { id },
    data: { status },
  });
};

export const AdminService = {
  getStats,
  getAllBookings,
  getAllUsers,
  updateUserStatus,
};