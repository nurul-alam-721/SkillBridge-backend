import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import config from "../config";

const adapter = new PrismaPg({
  connectionString: config.database_url!,
});

const prisma = new PrismaClient({ adapter });

export { prisma };