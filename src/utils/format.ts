/**
 * 生成情感化提示文案
 * @param scene 场景（register/login/reset/success/error）
 * @param nickname 昵称（可选）
 * @returns 情感化文案
 */
export const formatEmotionalMsg = (
  scene: 'register' | 'login' | 'reset' | 'success' | 'error',
  nickname?: string
): string => {
  const msgMap = {
    register: nickname ? `${nickname}，注册成功🥳 欢迎开启浪漫之旅～` : '注册成功🥳 欢迎开启浪漫之旅～',
    login: nickname ? `好久不见，${nickname}❤️ 登录成功～` : '登录成功❤️ 欢迎回来～',
    reset: '密码重置成功💖 快去登录吧～',
    success: '操作成功🎉',
    error: '操作失败😥 请稍后再试～',
  };
  return msgMap[scene];
};

/**
 * 格式化过期时间（显示剩余分钟）
 * @param expireTime 过期时间戳（Date对象）
 * @returns 格式化文案
 */
export const formatExpireTime = (expireTime: Date): string => {
  const now = new Date();
  const diffMinutes = Math.ceil((expireTime.getTime() - now.getTime()) / (1000 * 60));
  return `${diffMinutes}分钟后过期⏰`;
};