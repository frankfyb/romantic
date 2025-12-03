import Wechatmp from '@next-auth-oauth/wechatmp';

const appId = process.env.AUTH_WECHATMP_APP_ID || process.env.AUTH_WECHATMP_APPID || process.env.WECHAT_APPID || '';
const appSecret = process.env.AUTH_WECHATMP_APP_SECRET || process.env.AUTH_WECHATMP_APPSECRET || process.env.WECHAT_APPSECRET || '';
const token = process.env.AUTH_WECHATMP_TOKEN || process.env.WECHAT_TOKEN || '';
const aesKey = process.env.AUTH_WECHATMP_AESKEY || process.env.EncodingAESKey || '';
const baseUrl = process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
const endpoint = process.env.AUTH_WECHATMP_ENDPOINT || `${baseUrl}/api/auth/wechatmp`;

export const wechatmp = Wechatmp({
  clientId: appId,
  clientSecret: appSecret,
  token,
  aesKey,
  endpoint,
  checkType: 'MESSAGE',
  qrcodeImageUrl: '/user/0.jpg',
  platformType: 'official_account',
});

export const WechatmpProvider = wechatmp;
export const { GET: WechatmpGET, POST: WechatmpPOST } = wechatmp;
