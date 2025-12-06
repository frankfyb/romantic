import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 处理开发环境下的自签名证书问题
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prisma = globalThis.__prisma__ ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalThis.__prisma__ = prisma;

export { prisma };