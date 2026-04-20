import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import config from "../config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaNeon({
  connectionString: config.database_url!,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    errorFormat: config.NODE_ENV === "production" ? "minimal" : "pretty",
    log:
      config.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["warn", "error"],
  });

if (config.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}