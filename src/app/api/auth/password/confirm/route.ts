import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword } from "@/utils/validator";
import { verifyEmailCode } from "@/services/email/verifyCode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;
    if (!email || !code || !newPassword) {
      return NextResponse.json({ code: 400, msg: "邮箱、验证码与新密码均为必填" }, { status: 400 });
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ code: 400, msg: emailCheck.message }, { status: 400 });
    }
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json({ code: 400, msg: passwordCheck.message }, { status: 400 });
    }
    const isValid = await verifyEmailCode({ email, code, type: "RESET" });
    if (!isValid) {
      return NextResponse.json({ code: 400, msg: "验证码已过期或无效" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ code: 404, msg: "账号未注册" }, { status: 404 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return NextResponse.json({ code: 200, msg: "密码已更新" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ code: 500, msg: error.message || "重置失败" }, { status: 500 });
  }
}

