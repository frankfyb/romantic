import { prisma } from '@/lib/prisma';
import { LoginFormData, UserInfo } from '@/types/auth';
import { verifyPassword } from '@/utils/password';
import { validatePhone } from '@/utils/validator';

/**
 * 账号密码登录核心逻辑
 * @param data 登录表单数据
 * @returns 用户基本信息
 */
export const login = async (data: LoginFormData): Promise<UserInfo> => {
  const { phone, password } = data;

  // 1. 手机号格式校验
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) throw new Error(phoneCheck.message);

  // 2. 查询用户（按手机号）
  const user = await prisma.user.findUnique({
    where: { phone },
    select: {
      id: true,
      nickname: true,
      phone: true,
      passwordHash: true,
      avatar: true,
    },
  });

  if (!user) throw new Error('账号不存在😯，快去注册吧～');

  // 3. 密码校验
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) throw new Error('密码错误😭，再试一次？');

  // 4. 返回用户信息
  return {
    userId: user.id,
    nickname: user.nickname,
    phone: user.phone,
    avatar: user.avatar,
  };
};