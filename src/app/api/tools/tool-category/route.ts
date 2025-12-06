import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/prisma/categoryService';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/tools/tool-category:
 *   get:
 *     summary: 获取分类列表
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, updatedAt, createdAt] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *   post:
 *     summary: 创建分类
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '20');
    const sortBy = (searchParams.get('sortBy') || 'updatedAt') as any;
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as any;
    
    const data = await CategoryService.listCategories({ q, page, pageSize, sortBy, sortOrder });
    logger.info('tool-category.list', { q, page, pageSize, sortBy, sortOrder, total: data.total });
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tool-category.list.failed', { error: e?.message });
    // 回退：提供内置静态分类，避免前端报错
    const items = [
      { id: 'festival', name: '节日' },
      { id: 'confession', name: '表白' },
      { id: 'memory', name: '纪念' },
      { id: 'ai', name: 'AI创作' },
    ];
    const data = { items, total: items.length, page: 1, pageSize: items.length };
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await CategoryService.createCategory(body);
    logger.info('tool-category.create', { id: data.id, name: data.name });
    
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tool-category.create.failed', { error: e?.message });
    
    return NextResponse.json({ code: 500, msg: e?.message || '创建失败' }, { status: 500 });
  }
}