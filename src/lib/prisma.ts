import { PrismaClient } from "@prisma/client";

// 处理开发环境下的自签名证书问题
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prisma = globalThis.__prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.__prisma__ = prisma;

export { prisma };