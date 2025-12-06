import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/prisma/categoryService';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/tools/tool-category/{idOrSlug}:
 *   get:
 *     summary: 获取分类详情
 *   put:
 *     summary: 更新分类
 *   delete:
 *     summary: 删除分类
 */

export async function GET(_req: NextRequest, context: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await context.params;
  
  try {
    const data = await CategoryService.getCategory(idOrSlug);
    if (!data) return NextResponse.json({ code: 404, msg: '未找到分类' }, { status: 404 });
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tool-category.detail.failed', { error: e?.message });
    
    return NextResponse.json({ code: 500, msg: e?.message || '查询失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await context.params;
  
  try {
    const body = await req.json();
    const data = await CategoryService.updateCategory(idOrSlug, body);
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tool-category.update.failed', { error: e?.message });
    
    return NextResponse.json({ code: 500, msg: e?.message || '更新失败' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await context.params;
  
  try {
    const data = await CategoryService.deleteCategory(idOrSlug);
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tool-category.delete.failed', { error: e?.message });
    
    return NextResponse.json({ code: 500, msg: e?.message || '删除失败' }, { status: 500 });
  }
}