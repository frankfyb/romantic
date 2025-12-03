import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

/**
 * JWT校验中间件：拦截需登录的路由
 * 生效路由：/profile/**、/api/v1/auth/me/**
 */
export function authMiddleware(req: NextRequest) {
  try {
    // 排除公开路由
    const publicPaths = ['/auth/login', '/auth/register', '/auth/reset-password', '/api/v1/wechat'];
    if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 从Cookie获取JWT
    const token = req.cookies.get('romantic_token')?.value;
    if (!token) {
      // 未登录，跳转登录页
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // 验证JWT
    verifyJwt(token);
    return NextResponse.next();
  } catch (error) {
    // JWT无效/过期，跳转登录页
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}