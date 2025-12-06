import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('=== Detailed Database Verification ===\n');
    
    // 查看分类数据
    console.log('1. Categories:');
    const categories = await prisma.$queryRaw<{ id: string; name: string; description: string | null; sort: number }[]>`
      SELECT "id", "name", "description", "sort" FROM "Category" ORDER BY "sort"
    `;
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id.substring(0, 8)}..., Sort: ${cat.sort})`);
      if (cat.description) console.log(`     Description: ${cat.description}`);
    });
    
    console.log('\n2. Tool Metadata:');
    const tools = await prisma.$queryRaw<{ 
      id: string; 
      toolKey: string; 
      toolName: string; 
      description: string | null; 
      tag: string | null 
    }[]>`
      SELECT "id", "toolKey", "toolName", "description", "tag" 
      FROM "ToolMetadata" 
      ORDER BY "toolKey"
      LIMIT 10
    `;
    tools.forEach(tool => {
      console.log(`   - ${tool.toolName} (${tool.toolKey})`);
      console.log(`     ID: ${tool.id.substring(0, 8)}...`);
      if (tool.description) console.log(`     Description: ${tool.description}`);
      if (tool.tag) console.log(`     Tag: ${tool.tag}`);
    });
    
    console.log('\n3. Tool-Category Relations:');
    const relations = await prisma.$queryRaw<{ 
      toolKey: string; 
      categoryName: string 
    }[]>`
      SELECT tm."toolKey", c."name" as "categoryName"
      FROM "ToolCategory" tc
      JOIN "ToolMetadata" tm ON tc."toolId" = tm."id"
      JOIN "Category" c ON tc."categoryId" = c."id"
      ORDER BY tm."toolKey", c."name"
    `;
    relations.forEach(rel => {
      console.log(`   - ${rel.toolKey} -> ${rel.categoryName}`);
    });
    
    console.log('\n=== Summary ===');
    console.log(`Categories: ${categories.length}`);
    
    // 获取工具总数
    const toolCountResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count FROM "ToolMetadata"
    `;
    console.log(`Tools: ${toolCountResult[0].count.toString()}`);
    console.log(`Relations: ${relations.length}`);
    
  } catch (e: any) {
    console.error('Verification failed:', e?.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();