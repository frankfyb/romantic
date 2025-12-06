import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await ctx.params;
    const meta = await prisma.toolMetadata.findUnique({ where: { toolKey: key } });
    if (!meta || !meta.isActive) return NextResponse.json({ code: 404, msg: '未找到工具元信息' }, { status: 404 });
    const data = {
      toolKey: meta.toolKey,
      toolName: meta.toolName,
      description: meta.description,
      defaultConfig: meta.defaultConfig,
      tag: meta.tag,
      category: meta.category,
    };
    return NextResponse.json({ code: 200, data }, { status: 200 });
  } catch (e: any) {
    console.error('查询工具元信息失败:', e);
    return NextResponse.json({ code: 500, msg: e?.message || '查询失败' }, { status: 500 });
  }
}

