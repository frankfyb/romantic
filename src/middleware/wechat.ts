import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { wechatConfig } from '../../back/wechat';

/**
 * 微信签名验证中间件：仅拦截微信回调接口
 */
export function wechatMiddleware(req: NextRequest) {
  // 仅对微信回调接口生效
  if (!req.nextUrl.pathname.startsWith('/api/v1/wechat/callback')) {
    return NextResponse.next();
  }

  // GET请求已在接口内验证签名，此处仅处理POST请求的基础校验
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('xml')) {
      return NextResponse.json(
        { code: 400, msg: '请求体需为XML格式💢', data: null },
        { status: 400 }
      );
    }
  }

  return NextResponse.next();
}