import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // 1. 跨域配置
  const response = NextResponse.next();
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'];

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  // 2. 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers: response.headers });
  }

  // 3. 登录态校验（拦截受保护路由）
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/profile') || req.nextUrl.pathname.startsWith('/api/auth/me');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');

  if (isProtectedRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 4. 已登录用户访问登录/注册页 → 跳转首页
  if (isAuthRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return response;
}

// 中间件生效范围
export const config = {
  matcher: ['/api/v1/:path*', '/auth/:path*', '/profile/:path*'],
};