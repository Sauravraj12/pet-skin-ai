import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL must be configured.");
  }

  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

export function getDatabase(): PrismaClient {
  if (!globalThis.prismaClient) {
    globalThis.prismaClient = createPrismaClient();
  }
  return globalThis.prismaClient;
}
