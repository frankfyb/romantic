/** 注册表单数据类型 */
export interface RegisterFormData {
  nickname: string;
  phone: string;
  password: string;
  code: string;
  openid: string;
}

/** 登录表单数据类型 */
export interface LoginFormData {
  phone: string;
  password: string;
}

/** 重置密码表单数据类型 */
export interface ResetPasswordFormData {
  phone: string;
  nickname?: string; // 可选，辅助校验
  newPassword: string;
  code: string;
  openid: string;
}

/** 用户基本信息类型 */
export interface UserInfo {
  userId: string;
  nickname: string;
  phone: string;
  avatar?: string;
}

/** JWT载荷类型 */
export interface JwtPayload {
  userId: string;
  nickname: string;
}