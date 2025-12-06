import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // 测试数据库连接
    console.log('Testing database connection...');
    
    // 检查表是否存在
    const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('Category', 'ToolMetadata', 'ToolCategory')`
    );
    
    console.log('Existing tables:', tables.map(t => t.tablename));
    
    // 检查每个表的记录数
    const tableNames = ['Category', 'ToolMetadata', 'ToolCategory'];
    for (const tableName of tableNames) {
      try {
        const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
          `SELECT COUNT(*) AS count FROM "${tableName}"`
        );
        console.log(`${tableName} count:`, result[0].count.toString());
      } catch (e: any) {
        console.log(`Error querying ${tableName}:`, e?.message || e);
      }
    }
  } catch (e: any) {
    console.error('Connection test failed:', e?.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

main();