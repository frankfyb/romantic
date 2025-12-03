import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/utils/validator";
import { sendEmailVerifyCode } from "@/services/email/verifyCode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type } = body; // type: REGISTER/LOGIN/RESET

    // 校验邮箱
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ code: 400, msg: emailCheck.message }, { status: 400 });
    }

    // 校验类型
    const validTypes = ["REGISTER", "LOGIN", "RESET"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ code: 400, msg: "验证码类型无效😜" }, { status: 400 });
    }

    // 发送验证码
    const result = await sendEmailVerifyCode({ email, type });

    const payload: any = {
      code: 200,
      msg: `【${type === "REGISTER" ? "注册" : type === "LOGIN" ? "登录" : "重置密码"}】验证码已发送至你的邮箱💌，请查收～`,
    };
    if (process.env.EMAIL_FAKE_SEND === "true" || process.env.NODE_ENV !== "production") {
      payload.data = { code: result.code };
    }
    return NextResponse.json(payload, { status: 200 });

  } catch (error: any) {
    console.error("发送邮箱验证码错误：", error);
    return NextResponse.json(
      { code: 500, msg: error.message || "验证码发送失败😥，请稍后再试" },
      { status: 500 }
    );
  }
}
