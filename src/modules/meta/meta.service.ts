import { prisma } from "../../lib/prisma";

const getPlatformStats = async () => {
  const [totalStudents, totalTutors, totalCategories, avgRatingData] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TUTOR", status: "ACTIVE" } }),
      prisma.category.count(),
      prisma.tutorProfile.aggregate({
        _avg: { rating: true },
        where: { rating: { gt: 0 } },
      }),
    ]);

  return {
    totalStudents,
    totalTutors,
    totalSubjects: totalCategories,
    avgRating: avgRatingData._avg.rating ? Number(avgRatingData._avg.rating.toFixed(1)) : 0,
  };
};

export const MetaService = {
  getPlatformStats,
};
