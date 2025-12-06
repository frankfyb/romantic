import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { PrismaToolService } from '@/services/prisma/toolService';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ code: 401, msg: '未登录' }, { status: 401 });

    const body = await req.json();
    const { toolKey, config, expiresAt } = body || {};
    if (!toolKey || !config) return NextResponse.json({ code: 400, msg: '参数缺失' }, { status: 400 });

    // 简易结构校验（可换 zod）
    if (typeof config !== 'object') return NextResponse.json({ code: 400, msg: '配置格式不正确' }, { status: 400 });

    const { shareId } = await PrismaToolService.saveConfig(toolKey, config, { userId, expiresAt });
    return NextResponse.json({ code: 200, data: { shareId } }, { status: 200 });
  } catch (e: any) {
    console.error('保存配置失败:', e);
    return NextResponse.json({ code: 500, msg: e?.message || '保存失败' }, { status: 500 });
  }
}
