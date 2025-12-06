import { prisma } from '@/lib/prisma';
import { toolRegistry } from '@/config/toolsRegistry';

export type ToolFilter = {
  q?: string;
  tag?: string;
  category?: string;
  categoryId?: string;
};

export const ToolsListService = {
  async list(filter: ToolFilter = {}) {
    try {
      console.log('ToolsListService.list called with filter:', filter);
      
      const where: any = { isActive: true };
      if (filter.q) {
        where.OR = [
          { toolName: { contains: filter.q, mode: 'insensitive' } },
          { description: { contains: filter.q, mode: 'insensitive' } },
        ];
      }
      if (filter.tag) where.tag = filter.tag;
      if (filter.categoryId) {
        console.log('Applying categoryId filter:', filter.categoryId);
        where.categories = { some: { categoryId: filter.categoryId } };
      }
      else if (filter.category) where.category = filter.category;

      console.log('Final where clause:', JSON.stringify(where, null, 2));
      
      // 使用Prisma的findMany方法
      const tools = await (prisma as any).toolMetadata.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        select: {
          toolKey: true,
          toolName: true,
          description: true,
          tag: true,
        },
      });
      
      console.log('Found tools:', tools.length);
      return tools;
    } catch (e: any) {
      console.error('Database query failed:', e?.message || e);
      // 数据库不可用时，从注册表回退
      const items = Object.entries(toolRegistry).map(([k, v]) => ({
        toolKey: k,
        toolName: v.name,
        description: undefined,
        tag: undefined,
      }));
      const q = filter.q?.toLowerCase();
      const filtered = q ? items.filter((t) => t.toolName.toLowerCase().includes(q)) : items;
      return filtered;
    }
  },
};