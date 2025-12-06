import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/prisma/categoryService';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/tools/tool-category/{idOrSlug}/tools:
 *   get:
 *     summary: 获取分类下的工具列表
 */

export async function GET(req: NextRequest, context: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await context.params;
  
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '20');
    const sortBy = (searchParams.get('sortBy') || 'updatedAt') as any;
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as any;
    
    const data = await CategoryService.listToolsByCategory({ 
      categoryIdOrName: idOrSlug, 
      page, 
      pageSize, 
      sortBy, 
      sortOrder 
    });
    
    logger.info('tool-category.tools', { idOrSlug, page, pageSize, sortBy, sortOrder, total: data.total });
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tool-category.tools.failed', { error: e?.message });
    
    return NextResponse.json({ code: 500, msg: e?.message || '查询失败' }, { status: 500 });
  }
}