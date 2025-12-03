/**
 * 微信服务号配置（从环境变量读取）
 * 区分开发/生产环境
 */
export const wechatConfig = {
  WECHAT_APPID: process.env.WECHAT_APPID || '',
  WECHAT_APPSECRET: process.env.WECHAT_APPSECRET || '',
  WECHAT_TOKEN: process.env.WECHAT_TOKEN || '',
  // 微信消息推送回调URL（生产环境需改为公网域名）
  CALLBACK_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/v1/wechat/callback`,
};

// 校验配置完整性（开发环境警告，生产环境报错）
if (process.env.NODE_ENV === 'production') {
  Object.entries(wechatConfig).forEach(([key, value]) => {
    if (!value && key !== 'CALLBACK_URL') {
      throw new Error(`生产环境微信配置缺失：${key}`);
    }
  });
} else {
  Object.entries(wechatConfig).forEach(([key, value]) => {
    if (!value && key !== 'CALLBACK_URL') {
      console.warn(`开发环境微信配置缺失：${key}，部分功能可能不可用`);
    }
  });
}