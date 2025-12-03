/**
 * 手机号格式校验（11位，13-9开头）
 */
export const validatePhone = (phone: string): { valid: boolean; message: string } => {
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(phone)) {
    return { valid: false, message: '手机号格式错误📱，请输入11位有效手机号' };
  }
  return { valid: true, message: '手机号格式正确❤️' };
};

/**
 * 昵称格式校验（1-30字符，不含特殊符号）
 */
export const validateNickname = (nickname: string): { valid: boolean; message: string } => {
  const trimmedNickname = nickname.trim();
  if (trimmedNickname.length === 0) {
    return { valid: false, message: '昵称不能为空💖' };
  }
  if (trimmedNickname.length > 30) {
    return { valid: false, message: '昵称长度不能超过30字符😜' };
  }
  // 允许汉字、字母、数字、下划线
  const nicknameReg = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
  if (!nicknameReg.test(trimmedNickname)) {
    return { valid: false, message: '昵称仅支持汉字、字母、数字和下划线❤️' };
  }
  return { valid: true, message: '昵称格式正确🎉' };
};

/**
 * 密码强度校验（长度≥6，含字母+数字）
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: '密码长度需≥6位💖' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: '密码需同时包含字母和数字😜' };
  }
  return { valid: true, message: '密码强度符合要求❤️' };
};

export const validateEmail = (email: string): { valid: boolean; message: string } => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailReg.test(email)) {
    return { valid: false, message: '邮箱格式错误📧，请输入有效邮箱地址' };
  }
  return { valid: true, message: '邮箱格式正确❤️' };
};
