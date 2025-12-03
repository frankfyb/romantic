import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";

// 环境配置
const env = process.env as {
  EMAIL_FAKE_SEND?: string;
  EMAIL_SERVER_HOST?: string;
  EMAIL_SERVER_PORT?: string;
  EMAIL_SERVER_USER?: string;
  EMAIL_SERVER_PASSWORD?: string;
  EMAIL_FROM?: string;
};

// 邮件传输器（复用 SMTP 配置）
const useFakeSend = env.EMAIL_FAKE_SEND === "true";
const transporter = useFakeSend
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST || "smtp.qq.com",
      port: Number(env.EMAIL_SERVER_PORT) || 465,
      secure: true,
      auth: {
        user: env.EMAIL_SERVER_USER!,
        pass: env.EMAIL_SERVER_PASSWORD!,
      },
      pool: true,
      timeout: 30000,
    });

// 生成6位验证码（用于登录/注册，验证/重置用NextAuth的令牌）
const generateCode = () => randomInt(100000, 999999).toString();

// 核心：发送验证/重置邮件（复用 NextAuth 生成的链接）
export const sendEmailVerifyCode = async ({
  email,
  type, // REGISTER/LOGIN/RESET/VERIFY
  verifyUrl, // NextAuth 生成的验证/重置链接
  code,
}: {
  email: string;
  type: "REGISTER" | "LOGIN" | "RESET" | "VERIFY";
  verifyUrl?: string;
  code?: string;
}) => {
  try {
    const appName = "你的应用名";
    const verifyCode = code || (type !== "VERIFY" ? generateCode() : "");
    
    // 存储验证码（验证/重置用NextAuth的令牌，无需存储）
    if (type !== "VERIFY") {
      await prisma.emailVerifyCode.upsert({
        where: { email_type_isUsed: { email, type, isUsed: false } },
        update: { code: verifyCode, expires: new Date(Date.now() + 10 * 60 * 1000) },
        create: { email, code: verifyCode, type, expires: new Date(Date.now() + 10 * 60 * 1000) },
      });
    }

    // 邮件模板（区分验证/重置）
    let subject = "";
    let html = "";
    switch (type) {
      case "VERIFY":
        subject = `【${appName}】邮箱验证`;
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial;">
            <h2 style="color: #2d3748;">验证你的邮箱 📧</h2>
            <p style="font-size: 16px; color: #4a5568;">点击下方链接完成验证：</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #4299e1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              立即验证邮箱
            </a>
            <p style="font-size: 14px; color: #718096;">链接有效期24小时，如非本人操作请忽略</p>
          </div>
        `;
        break;
      case "RESET":
        subject = `【${appName}】密码重置`;
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial;">
            <h2 style="color: #2d3748;">重置你的密码 🔑</h2>
            <p style="font-size: 16px; color: #4a5568;">点击下方链接重置密码：</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #e53e3e; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              立即重置密码
            </a>
            <p style="font-size: 14px; color: #718096;">链接有效期24小时，如非本人操作请忽略</p>
          </div>
        `;
        break;
      // 其他类型（REGISTER/LOGIN）模板省略
      default:
        subject = `【${appName}】${type === "REGISTER" ? "注册" : "登录"}验证码`;
        html = `<div>你的验证码：<strong>${verifyCode}</strong></div>`;
    }

    // 发送邮件
    const result = await transporter.sendMail({
      from: `"${appName}" <${env.EMAIL_FROM || env.EMAIL_SERVER_USER}>`,
      to: email,
      subject,
      html,
    });

    // 开发环境日志
    if (useFakeSend) console.log("假发送邮件内容：", JSON.stringify(result, null, 2));

    return { success: true, code: verifyCode };
  } catch (error) {
    console.error(`发送${type}邮件失败：`, error);
    throw new Error(`发送${type === "VERIFY" ? "验证" : "重置"}邮件失败，请稍后重试`);
  }
};

// 验证码校验（用于登录/注册，验证/重置用NextAuth内置逻辑）
export const verifyEmailCode = async ({ email, code, type }) => {
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.emailVerifyCode.findFirst({
      where: { email, code, type, isUsed: false, expires: { gt: new Date() } },
    });
    if (!record) return false;
    await tx.emailVerifyCode.update({ where: { id: record.id }, data: { isUsed: true } });
    return true;
  });
  return result;
};