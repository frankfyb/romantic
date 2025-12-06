import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const genShareId = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let id = '';
  for (let i = 0; i < 12; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  return id;
};

export const PrismaToolService = {
  async getToolMetadata(toolKey: string) {
    const meta = await prisma.toolMetadata.findUnique({ where: { toolKey } });
    return meta;
  },

  async saveConfig(toolKey: string, config: Record<string, any>, options: { userId: string; fingerprint?: string; expiresAt?: string }) {
    if (!toolKey || !options?.userId || !config || typeof config !== 'object') {
      throw new Error('参数缺失或格式错误');
    }
    let shareId = genShareId();
    const genId = () => {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let s = 'cfg_';
      for (let i = 0; i < 24; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
      return s;
    };
    let configId = genId();
    for (let i = 0; i < 3; i++) {
      try {
        const rows = await prisma.$queryRaw<{ id: string; shareId: string }[]>((Prisma as any).sql`
          INSERT INTO "ToolConfig" ("id","toolKey","config","shareId","userId","fingerprint","expiresAt","updatedAt")
          VALUES (${configId}, ${toolKey}, ${JSON.stringify(config)}::jsonb, ${shareId}, ${options.userId}, ${options.fingerprint ?? null}, ${options.expiresAt ? new Date(options.expiresAt) : null}, ${new Date()})
          RETURNING "id","shareId"
        `);
        const rec = rows?.[0];
        if (rec) return { shareId: rec.shareId, configId: rec.id };
        throw new Error('插入失败');
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg.includes('unique') || msg.includes('Unique') || msg.includes('duplicate key')) {
          shareId = genShareId();
          configId = genId();
          continue;
        }
        throw e;
      }
    }
    throw new Error('生成分享ID失败');
  },

  async getConfigByShareId(shareId: string) {
    const rows = await prisma.$queryRaw<{ id: string; toolKey: string; config: any; shareId: string }[]>((Prisma as any).sql`
      SELECT "id","toolKey","config","shareId" FROM "ToolConfig"
      WHERE "shareId"=${shareId} AND "isDeleted"=false AND ("expiresAt" IS NULL OR "expiresAt">=now())
      LIMIT 1
    `);
    return rows?.[0] ?? null;
  },
};
