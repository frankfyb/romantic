const nodemailer = require("nodemailer");
require("dotenv").config();

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
      to: "frankfyb@163.com",
      subject: "验证码测试",
      text: "测试验证码：123456",
    });
    console.log("发送成功:", info.messageId);
  } catch (e) {
    console.error("发送失败:", e.message);
  }
}

main();
