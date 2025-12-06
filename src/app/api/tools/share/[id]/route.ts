import { NextRequest, NextResponse } from 'next/server';
import { PrismaToolService } from '@/services/prisma/toolService';

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const rec = await PrismaToolService.getConfigByShareId(id);
    if (!rec) return NextResponse.json({ code: 404, msg: '分享配置不存在或已过期' }, { status: 404 });
    return NextResponse.json({ code: 200, data: rec }, { status: 200 });
  } catch (e: any) {
    console.error('查询分享失败:', e);
    return NextResponse.json({ code: 500, msg: e?.message || '查询失败' }, { status: 500 });
  }
}
