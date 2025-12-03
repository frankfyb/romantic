import bcrypt from 'bcrypt';

/**
 * 密码哈希处理（bcrypt）
 * @param password 明文密码
 * @returns 加密后的哈希值
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * 密码校验（对比明文与哈希值）
 * @param password 明文密码
 * @param hashedPassword 存储的哈希值
 * @returns 是否匹配
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 密码强度校验（长度≥6，含字母+数字）
 * @param password 明文密码
 * @returns 校验结果+错误提示
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: '密码长度需≥6位💖' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: '密码需包含字母和数字😜' };
  }
  return { valid: true, message: '密码强度符合要求❤️' };
};