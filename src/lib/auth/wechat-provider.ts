import axios from "axios";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID!,
  appSecret: process.env.WECHAT_APPSECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/wechat`,
};

const WechatProvider: NextAuthOptions["providers"][0] = {
  id: "wechat",
  name: "Wechat",
  type: "oauth",
  // 静默授权配置（个人服务号仅支持 snsapi_base）
  authorization: {
    url: "https://open.weixin.qq.com/connect/oauth2/authorize",
    params: {
      appid: WECHAT_CONFIG.appId,
      redirect_uri: WECHAT_CONFIG.redirectUri,
      response_type: "code",
      scope: "snsapi_base",
      state: "nextauth",
      connect_redirect: 1, // 静默授权必填
    },
  },
  // 获取 OpenID（核心）
  token: {
    async request({ params }) {
      const { data } = await axios.get(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${params.code}&grant_type=authorization_code`
      );
      if (data.errcode) throw new Error(`微信授权失败：${data.errmsg}`);
      return { tokens: { openid: data.openid } };
    },
  },
  // 空实现（个人服务号无用户信息）
  userinfo: {
    async request({ tokens }) {
      return { openid: tokens.openid };
    },
  },
  // 映射用户信息
  profile(profile) {
    return {
      id: profile.openid,
      name: "微信用户",
      wechatOpenId: profile.openid,
    };
  },
  // 验证/创建用户
  async authorize({ tokens }) {
    const existingUser = await prisma.user.findUnique({
      where: { wechatOpenId: tokens.openid },
    });
    if (existingUser) return existingUser;
    // 新用户：仅绑定 OpenID
    return await prisma.user.create({
      data: {
        name: "微信用户",
        wechatOpenId: tokens.openid,
        wechatBindAt: new Date(),
      },
    });
  },
};

export default WechatProvider;