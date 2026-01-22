import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const isAccelerate = databaseUrl.startsWith("prisma://") ||
                       databaseUrl.includes("accelerate.prisma-data.net");

  const client = new PrismaClient();

  if (isAccelerate) {
    return client.$extends(withAccelerate());
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
