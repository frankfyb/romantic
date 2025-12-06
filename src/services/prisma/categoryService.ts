import { prisma } from '@/lib/prisma';
import type { 
  CategoryListParams, 
  CategoryToolsListParams,
  CategoryListResponse,
  CategoryToolsListResponse
} from '@/types/category';

// 分类服务
export const CategoryService = {
  /**
   * 创建分类
   * @param payload 分类信息
   * @returns 创建的分类
   */
  async createCategory(payload: { name: string; description?: string; sort?: number }) {
    const { name, description, sort = 0 } = payload;
    return prisma.category.create({ 
      data: { 
        name, 
        description: description ?? null, 
        sort 
      } 
    });
  },

  /**
   * 更新分类
   * @param idOrName 分类ID或名称
   * @param patch 更新内容
   * @returns 更新后的分类
   */
  async updateCategory(idOrName: string, patch: { name?: string; description?: string; sort?: number }) {
    // 先尝试按ID查找
    const byId = await prisma.category.findUnique({ where: { id: idOrName } });
    const where = byId ? { id: idOrName } : { name: idOrName };
    
    return prisma.category.update({ 
      where: where as any, 
      data: { ...patch } 
    });
  },

  /**
   * 删除分类
   * @param idOrName 分类ID或名称
   * @returns 删除结果
   */
  async deleteCategory(idOrName: string) {
    // 先尝试按ID查找
    const byId = await prisma.category.findUnique({ where: { id: idOrName } });
    const where = byId ? { id: idOrName } : { name: idOrName };
    
    await prisma.category.delete({ where: where as any });
    return { success: true };
  },

  /**
   * 获取分类详情
   * @param idOrName 分类ID或名称
   * @returns 分类详情
   */
  async getCategory(idOrName: string) {
    // 先尝试按ID查找
    const byId = await prisma.category.findUnique({ where: { id: idOrName } });
    if (byId) return byId;
    
    // 按名称查找
    return prisma.category.findUnique({ where: { name: idOrName } });
  },

  /**
   * 获取分类列表
   * @param params 查询参数
   * @returns 分类列表和分页信息
   */
  async listCategories(params: CategoryListParams = {}): Promise<CategoryListResponse> {
    const { q, page = 1, pageSize = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = params;
    
    // 构建查询条件
    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } }, 
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    // 获取总数
    const total = await prisma.category.count({ where });
    
    // 获取分类列表
    const items = await prisma.category.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return { items, total, page, pageSize };
  },

  /**
   * 获取分类下的工具列表
   * @param params 查询参数
   * @returns 工具列表和分页信息
   */
  async listToolsByCategory(params: CategoryToolsListParams): Promise<CategoryToolsListResponse> {
    const { categoryIdOrName, page = 1, pageSize = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = params;
    
    // 查找分类
    const category = await prisma.category.findUnique({ where: { id: categoryIdOrName } })
      .then(c => c || prisma.category.findUnique({ where: { name: categoryIdOrName } }));
      
    // 如果分类不存在，返回空结果
    if (!category) {
      return { items: [], total: 0, page, pageSize };
    }
    
    // 构建工具查询条件
    const where: any = { 
      isActive: true, 
      categories: { 
        some: { 
          categoryId: category.id 
        } 
      } 
    };
    
    // 获取总数
    const total = await prisma.toolMetadata.count({ where });
    
    // 获取工具列表
    const items = await prisma.toolMetadata.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { 
        toolKey: true, 
        toolName: true, 
        description: true, 
        tag: true 
      },
    });
    
    return { items, total, page, pageSize };
  },
};