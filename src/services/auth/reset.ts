import { prisma } from '@/lib/prisma';
import { ResetPasswordFormData } from '@/types/auth';
import { CodeType } from '../../../back/weichat/wechat';
import { hashPassword, validatePassword } from '@/utils/password';
import { validatePhone, validateCode, validateNickname } from '@/utils/validator';

/**
 * 密码重置核心逻辑（OpenID绑定校验→验证码验证→密码更新）
 * @param data 重置密码表单数据
 */
export const resetPassword = async (data: ResetPasswordFormData): Promise<void> => {
  const { phone, nickname, newPassword, code, openid } = data;

  // 1. 参数校验
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) throw new Error(phoneCheck.message);

  const codeCheck = validateCode(code);
  if (!codeCheck.valid) throw new Error(codeCheck.message);

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) throw new Error(passwordCheck.message);

  // 可选：昵称辅助校验
  if (nickname) {
    const nicknameCheck = validateNickname(nickname);
    if (!nicknameCheck.valid) throw new Error(nicknameCheck.message);
  }

  // 2. 校验OpenID与手机号绑定关系
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true, nickname: true, wechatOpenId: true },
  });

  if (!user) throw new Error('账号不存在😯');
  if (user.wechatOpenId !== openid) throw new Error('该微信未绑定此账号💔');

  // 可选：昵称匹配校验
  if (nickname && user.nickname !== nickname) throw new Error('昵称与手机号不匹配😜');

  // 3. 验证重置验证码有效性
  const verifyCode = await prisma.wechatVerifyCode.findFirst({
    where: {
      openid,
      code,
      type: CodeType.RESET,
      expires: { gt: new Date() },
      isUsed: false,
    },
  });

  if (!verifyCode) throw new Error('验证码已过期或无效😜，请重新获取');

  // 4. 事务更新密码+标记验证码已使用
  const newPasswordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    // 更新密码
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    }),
    // 标记验证码已使用
    prisma.wechatVerifyCode.update({
      where: { id: verifyCode.id },
      data: { isUsed: true },
    }),
  ]);
};