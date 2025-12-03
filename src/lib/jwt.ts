import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types/auth';

// 从环境变量获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_keep_it_secure';
const JWT_EXPIRES_IN = '7d'; // 7天有效期

/**
 * 生成JWT令牌
 * @param payload JWT载荷（userId+nickname）
 * @returns JWT字符串
 */
export const generateJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * 验证JWT令牌并解析载荷
 * @param token JWT字符串
 * @returns 解析后的载荷（JwtPayload）
 */
export const verifyJwt = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT验证失败：', error);
    throw new Error('登录态已过期，请重新登录❤️');
  }
};