import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword, validateNickname } from "@/utils/validator";
import { sendEmailVerifyCode, verifyEmailCode } from "@/services/email/verifyCode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nickname, password, confirmPassword, code } = body;

    // 1. 基础校验
    if (!email || !nickname || !password || !confirmPassword || !code) {
      return NextResponse.json(
        { code: 400, msg: "所有字段均为必填项💖" },
        { status: 400 }
      );
    }

    // 2. 格式校验
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return NextResponse.json({ code: 400, msg: emailCheck.message }, { status: 400 });

    const nicknameCheck = validateNickname(nickname);
    if (!nicknameCheck.valid) return NextResponse.json({ code: 400, msg: nicknameCheck.message }, { status: 400 });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return NextResponse.json({ code: 400, msg: passwordCheck.message }, { status: 400 });

    if (password !== confirmPassword) {
      return NextResponse.json({ code: 400, msg: "两次密码输入不一致😜" }, { status: 400 });
    }

    // 3. 校验注册验证码
    const isCodeValid = await verifyEmailCode({ email, code, type: "REGISTER" });
    if (!isCodeValid) {
      return NextResponse.json({ code: 400, msg: "验证码已过期或无效😜" }, { status: 400 });
    }

    // 4. 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ code: 409, msg: "该邮箱已注册❤️，直接登录吧～" }, { status: 409 });
    }

    // 5. 创建用户
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name: nickname,
        passwordHash,
        emailVerified: null, // 未验证邮箱
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json(
      { code: 200, msg: "注册成功🥳，快去登录吧～", data: newUser },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("邮箱注册接口错误：", error);
    return NextResponse.json(
      { code: 500, msg: error.message || "注册失败😥，请稍后再试" },
      { status: 500 }
    );
  }
}
