import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToolDefaultConfig, getToolName } from '@/config/toolsRegistry';

export async function GET(_: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await ctx.params;
    const meta = await prisma.toolMetadata.findUnique({ where: { toolKey: key } });
    if (meta && meta.isActive) {
      const data = {
        toolKey: meta.toolKey,
        toolName: meta.toolName,
        description: meta.description,
        defaultConfig: meta.defaultConfig,
        tag: meta.tag,
        category: meta.category,
      };
      return NextResponse.json({ code: 200, data }, { status: 200 });
    }

    // 本地回退：若数据库未配置该工具，则从本地注册表返回默认配置
    try {
      const localData = {
        toolKey: key,
        toolName: getToolName(key as any),
        description: undefined,
        defaultConfig: getToolDefaultConfig(key as any),
        tag: undefined,
        category: undefined,
      };
      return NextResponse.json({ code: 200, data: localData }, { status: 200 });
    } catch {
      return NextResponse.json({ code: 404, msg: '未找到工具元信息' }, { status: 404 });
    }
  } catch (e: any) {
    console.error('查询工具元信息失败:', e);
    return NextResponse.json({ code: 500, msg: e?.message || '查询失败' }, { status: 500 });
  }
}
