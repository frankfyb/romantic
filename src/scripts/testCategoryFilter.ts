import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 处理开发环境下的自签名证书问题
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const categoryId = '4df572a3-7ba8-4a95-930e-2eabf301ce5c';
    
    // 测试直接查询
    console.log('Testing direct query with categoryId:', categoryId);
    
    const tools = await (prisma as any).toolMetadata.findMany({
      where: {
        isActive: true,
        categories: { 
          some: { 
            categoryId: categoryId 
          } 
        }
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        toolKey: true,
        toolName: true,
        description: true,
        tag: true,
      },
    });
    
    console.log('Filtered tools count:', tools.length);
    console.log('Filtered tools:', JSON.stringify(tools, null, 2));
    
    // 测试所有工具
    const allTools = await (prisma as any).toolMetadata.findMany({
      where: {
        isActive: true
      },
      select: {
        toolKey: true,
        toolName: true,
      },
    });
    
    console.log('All tools count:', allTools.length);
    
  } catch (e: any) {
    console.error('Test failed:', e?.message || e);
  } finally {
    process.exit(0);
  }
}

main();