import { NextRequest, NextResponse } from 'next/server';
import { ToolsListService } from '@/services/prisma/toolsListService';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    const data = await ToolsListService.list({ q, category, tag, ...(categoryId ? { categoryId } : {}) } as any);
    logger.info('tools.list', { q, category, tag, count: data.length });
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    logger.error('tools.list.failed', { error: e?.message });
    return NextResponse.json({ code: 500, msg: e?.message || '查询失败' }, { status: 500 });
  }
}
