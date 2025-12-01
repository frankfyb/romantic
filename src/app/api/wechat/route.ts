import { NextRequest, NextResponse } from "next/server";
import xml2js from "xml2js";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const WECHAT_CONFIG = {
  token: process.env.WECHAT_TOKEN!,
  appId: process.env.WECHAT_APPID!,
};

// 生成6位验证码
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// 验证微信签名
const verifySignature = (req: NextRequest) => {
  const { signature, timestamp, nonce } = Object.fromEntries(req.nextUrl.searchParams);
  const arr = [WECHAT_CONFIG.token, timestamp, nonce].sort().join("");
  return crypto.createHash("sha1").update(arr).digest("hex") === signature;
};

// 构建XML回复
const buildXml = (to: string, from: string, content: string) => `
  <xml>
    <ToUserName><![CDATA[${to}]]></ToUserName>
    <FromUserName><![CDATA[${from}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
  </xml>
`.trim();

// 处理关注事件
const handleSubscribe = async (openid: string) => {
  const code = generateCode();
  // 存储验证码（10分钟过期，覆盖旧验证码）
  await prisma.wechatVerifyCode.upsert({
    where: { openid },
    update: { code, expires: new Date(Date.now() + 10 * 60 * 1000), isUsed: false },
    create: { openid, code, expires: new Date(Date.now() + 10 * 60 * 1000) },
  });
  return `🎉 感谢关注！你的注册验证码是：${code}（10分钟内有效）
请返回注册页面输入验证码完成登录～`;
};

// GET：微信服务器验证
export async function GET(req: NextRequest) {
  if (!verifySignature(req)) return NextResponse.json("Invalid", { status: 403 });
  return NextResponse.json(req.nextUrl.searchParams.get("echostr"));
}

// POST：处理公众号消息
export async function POST(req: NextRequest) {
  if (!verifySignature(req)) return NextResponse.json("Invalid", { status: 403 });

  const xml = await req.text();
  const { xml: data } = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(xml);
  
  let reply = "🤔 回复「验证码」可重新获取注册验证码～";
  // 关注事件
  if (data.MsgType === "event" && data.Event === "subscribe") {
    reply = await handleSubscribe(data.FromUserName);
  }
  // 文本消息（重新获取验证码）
  else if (data.MsgType === "text" && data.Content.includes("验证码")) {
    reply = await handleSubscribe(data.FromUserName);
  }

  return new NextResponse(buildXml(data.FromUserName, data.ToUserName, reply), {
    headers: { "Content-Type": "text/xml" },
  });
}