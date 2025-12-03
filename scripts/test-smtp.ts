import nodemailer from "nodemailer";

async function main() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
    authMethod: "LOGIN",
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: user!,
      subject: "SMTP 测试邮件",
      text: "这是一封用于测试 163 SMTP 授权码是否可用的邮件",
    });
    console.log("发送成功:", info.messageId);
  } catch (e: any) {
    console.error("发送失败:", e.message);
  }
}

main();
