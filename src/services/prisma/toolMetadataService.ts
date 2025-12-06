import { prisma } from '@/lib/prisma';

export const ToolMetadataService = {
  async create(input: { toolKey: string; toolName: string; description?: string; tag?: string; category?: string; defaultConfig: any }) {
    return prisma.toolMetadata.create({ data: input });
  },
  async update(toolKey: string, updates: Partial<{ toolName: string; description: string; tag: string; category: string; defaultConfig: any; isActive: boolean }>) {
    return prisma.toolMetadata.update({ where: { toolKey }, data: updates });
  },
  async remove(toolKey: string) {
    return prisma.toolMetadata.update({ where: { toolKey }, data: { isActive: false } });
  },
  async get(toolKey: string) {
    return prisma.toolMetadata.findUnique({ where: { toolKey } });
  },
  async listAll() {
    return prisma.toolMetadata.findMany({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } });
  },
};

