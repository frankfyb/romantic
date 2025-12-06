import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const cat = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) AS count FROM "Category"`;
    const tools = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) AS count FROM "ToolMetadata"`;
    const rel = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) AS count FROM "ToolCategory"`;
    console.log('Category count:', cat?.[0]?.count.toString() || '0');
    console.log('ToolMetadata count:', tools?.[0]?.count.toString() || '0');
    console.log('ToolCategory (relations) count:', rel?.[0]?.count.toString() || '0');
  } catch (e: any) {
    console.error('Verify failed:', e?.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();