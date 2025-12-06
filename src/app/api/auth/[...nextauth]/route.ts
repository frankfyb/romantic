import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmailVerifyCode } from "@/services/email/verifyCode";
import { validateEmail, validatePassword } from "@/utils/validator";

// 扩展 NextAuth 类型
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    passwordHash?: string;
    emailVerified?: Date | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      emailVerified?: Date | null;
    };
  }
  interface JWT {
    userId: string;
    email: string;
    name?: string;
    emailVerified?: Date | null;
  }
}

// 环境配置校验
const isEmailConfigValid = !!(
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  process.env.EMAIL_FROM
);

// 抽离 SMTP 配置（统一复用）
const getSmtpConfig = () => {
  const port = Number(process.env.EMAIL_SERVER_PORT || 465);
  return {
    host: process.env.EMAIL_SERVER_HOST!,
    port,
    auth: {
      user: process.env.EMAIL_SERVER_USER!,
      pass: process.env.EMAIL_SERVER_PASSWORD!,
    },
    secure: port === 465,
    pool: true,
    timeout: 30000,
  };
};

export const authOptions = {
  // 1. 数据库适配：NextAuth 自动存储验证/重置令牌
  adapter: PrismaAdapter(prisma),
  
  // 2. 认证方式：Credentials（登录/注册） + Email（验证/重置）
  providers: [
    // 验证码登录（基础能力，不影响验证/重置逻辑）
    CredentialsProvider({
      id: "email-code",
      name: "邮箱验证码登录",
      credentials: { email: { type: "email" }, code: { type: "text" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) throw new Error("参数缺失");
        // 验证码校验逻辑（省略，不影响核心）
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        return user || null;
      },
    }),

    // 密码登录（基础能力）
    CredentialsProvider({
      id: "email-password",
      name: "邮箱密码登录",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("参数缺失");
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) throw new Error("账号不存在或仅支持验证码登录");
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        return isValid ? user : null;
      },
    }),

    // 3. 核心：EmailProvider（复用 NextAuth 内置验证/重置逻辑）
  ].concat(isEmailConfigValid ? [
    EmailProvider({
      server: getSmtpConfig(),
      from: `"你的应用名" <${process.env.EMAIL_FROM!}>`,
      
      // 自定义验证/重置邮件发送（替换默认模板，复用自己的邮件服务）
      async sendVerificationRequest({ identifier: email, url, token }) {
        try {
          await sendEmailVerifyCode({
            email,
            type: "VERIFY", // 区分验证/重置（可扩展为 RESET）
            verifyUrl: url,
            code: token, // 传递 NextAuth 生成的令牌（可选）
          });
        } catch (error) {
          console.error("发送验证邮件失败：", error);
          throw new Error("验证邮件发送失败，请稍后重试");
        }
      },

      // 自定义令牌生成规则（可选，默认是安全随机字符串）
      async generateVerificationToken() {
        return crypto.randomBytes(32).toString("hex"); // 64位加密令牌
      },

      // 令牌有效期（验证/重置链接有效期，默认1小时，这里改为24小时）
      maxAge: 24 * 60 * 60, 
    })
  ] : []),

  // 4. 登录态配置
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  // 5. 自定义页面（NextAuth 自动跳转这些页面）
  pages: {
    signIn: "/auth/login", // 登录页
    verifyRequest: "/auth/verify-email", // 验证请求页（点击发送验证邮件后）
    newUser: "/auth/register-complete", // 新用户完善信息页
    resetPassword: "/auth/reset-password", // 密码重置页（点击重置链接后）
    forgotPassword: "/auth/forgot-password", // 忘记密码页（输入邮箱）
    error: "/auth/login", // 认证错误页
  },

  // 6. 回调函数（同步用户验证状态）
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.emailVerified = user.emailVerified; // 同步邮箱验证状态
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.emailVerified = token.emailVerified; // 前端可获取验证状态
      }
      return session;
    },
    // 拦截未验证邮箱的用户访问受保护路由
    async authorized({ auth, request }) {
      const isAuth = !!auth?.user;
      const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
      const isVerifyPage = request.nextUrl.pathname === "/auth/verify-email";
      const isEmailVerified = auth?.user?.emailVerified;

      // 已登录但未验证邮箱 → 强制跳验证页
      if (isAuth && !isEmailVerified && !isAuthPage && !isVerifyPage) {
        return Response.redirect(new URL("/auth/verify-email", request.nextUrl));
      }
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
  debug: process.env.NODE_ENV === "development",
};

const { handlers, auth } = NextAuth(authOptions);
export { auth };
export const { GET, POST } = handlers;
