import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { id: randomUUID(), name: '节日', description: '节庆主题，如情人节、生日等', sort: 10 },
  { id: randomUUID(), name: '表白', description: '表达爱意与心意的主题', sort: 20 },
  { id: randomUUID(), name: '纪念', description: '纪念重要时刻与回忆', sort: 30 },
  { id: randomUUID(), name: 'AI创作', description: 'AI 生成的创意与内容', sort: 40 },
];

const tools = [
  {
    id: randomUUID(),
    toolKey: 'warm-text-card',
    toolName: '温馨文字卡片',
    description: '定制专属的电子心意',
    tag: '热门',
    defaultConfig: { theme: 'warm', maxCards: 12, speed: 1200, fontSizeScale: 1.0 },
    categories: ['表白'],
  },
  {
    id: randomUUID(),
    toolKey: 'time-capsule',
    toolName: '时光胶囊',
    description: '设定开启时间，封存一段心声',
    tag: '纪念',
    defaultConfig: { recipient: '亲爱的', message: '等你开启', themeColor: 'indigo', openDate: '2099-01-01T00:00' },
    categories: ['纪念'],
  },
  {
    id: randomUUID(),
    toolKey: 'starry-sky',
    toolName: '星河情书',
    description: '互动的星空与文字流星',
    tag: '特效',
    defaultConfig: { title: '星河情书', partnerName: '亲爱的', confessionText: '我看过万千星河', starDensity: 150, themeIndex: 0 },
    categories: ['表白'],
  },
  {
    id: randomUUID(),
    toolKey: 'memory-box',
    toolName: '回忆盲盒',
    description: '翻开盲盒，解锁共同回忆',
    tag: '纪念',
    defaultConfig: {
      name1: '小明', name2: '小红', date: '2023-05-20', themeColor: 'pink',
      finalImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2000&auto=format&fit=crop',
      finalMessage: '周年快乐，永远爱你！',
    },
    categories: ['纪念'],
  },
];

async function main() {
  console.log('Seeding test data...');

  // 0. 开启事务上下文（尽量原子）
  // 使用原始 SQL，避免 Prisma Client 类型与当前 schema 不一致导致编译失败

  // 1. 分类 upsert（ON CONFLICT name）
  for (const c of categories) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Category" ("id", "name","description","sort", "updatedAt")
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT ("name") DO UPDATE SET "description"=EXCLUDED."description", "sort"=EXCLUDED."sort", "updatedAt"=now()`,
      c.id, c.name, c.description ?? null, c.sort
    );
  }

  // 2. 工具 upsert（ON CONFLICT toolKey）
  for (const t of tools) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ToolMetadata" ("id", "toolKey","toolName","description","tag","defaultConfig","isActive", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, true, now())
       ON CONFLICT ("toolKey") DO UPDATE SET "toolName"=EXCLUDED."toolName", "description"=EXCLUDED."description", "tag"=EXCLUDED."tag", "defaultConfig"=EXCLUDED."defaultConfig", "isActive"=true, "updatedAt"=now()`,
      t.id, t.toolKey, t.toolName, t.description, t.tag, JSON.stringify(t.defaultConfig)
    );

    // 2.1 工具-分类关联（如果存在关联表）
    for (const cn of t.categories) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ToolCategory" ("id", "toolId","categoryId", "updatedAt")
         SELECT $1, tm."id", c."id", now()
         FROM "ToolMetadata" tm, "Category" c
         WHERE tm."toolKey" = $2 AND c."name" = $3
         ON CONFLICT ("toolId","categoryId") DO NOTHING`,
        randomUUID(), t.toolKey, cn
      );
    }
  }

  // 3. 大批量工具（20条）
  for (let i = 0; i < 20; i++) {
    const key = `test-tool-${i}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ToolMetadata" ("id", "toolKey","toolName","defaultConfig","isActive", "updatedAt")
       VALUES ($1, $2, $3, $4::jsonb, true, now())
       ON CONFLICT ("toolKey") DO UPDATE SET "toolName"=EXCLUDED."toolName", "defaultConfig"=EXCLUDED."defaultConfig", "isActive"=true, "updatedAt"=now()`,
      randomUUID(), key, `测试工具${i}`, JSON.stringify({ idx: i })
    );
  }

  console.log('Seed completed');
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});