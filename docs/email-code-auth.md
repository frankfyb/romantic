# 邮箱验证码注册与重置联调说明

## 环境变量配置
- `EMAIL_SERVER_HOST`：SMTP 主机
- `EMAIL_SERVER_PORT`：SMTP 端口（如 465）
- `EMAIL_SERVER_USER`：邮箱账号
- `EMAIL_SERVER_PASSWORD`：邮箱授权码/密码
- `EMAIL_FROM`：发件人邮箱（如 `no-reply@example.com`）
- `EMAIL_FAKE_SEND`：开发模式使用 JSON 发送（`true` 可在响应内返回验证码）
- `NEXTAUTH_SECRET`：NextAuth 签名密钥

## 接口一览
- 发送验证码：`POST /api/auth/email/code` `{ email, type: 'REGISTER'|'LOGIN'|'RESET' }`
- 完成注册：`POST /api/users/register` `{ email, nickname, password, confirmPassword, code }`
- 重置密码：`POST /api/auth/password/confirm` `{ email, code, newPassword }`
- 登录（前端）：`signIn('email-password' | 'email-code')`

## 验证流程
- 注册：发送 `REGISTER` 验证码 → 表单提交注册 → 成功后使用密码或验证码登录
- 登录：发送 `LOGIN` 验证码 → 通过 `email-code` 登录；或直接使用密码通过 `email-password` 登录
- 重置：发送 `RESET` 验证码 → 提交新密码 → 成功后使用新密码登录

## 开发联调建议
- 本地将 `EMAIL_FAKE_SEND=true`，接口返回体会包含 `data.code` 便于测试
- 验证码默认 10 分钟有效，使用后标记失效；60 秒倒计时防重复发送
- 注册时校验密码强度（长度≥6，字母+数字）与昵称格式（≤30，允许汉字/字母/数字/下划线）

## 常见问题
- 未收到邮件：检查 SMTP 配置与发件箱是否被服务商限制；可先使用 `EMAIL_FAKE_SEND=true`
- 登录失败：确认验证码是否未过期且未被使用；密码登录需用户存在且 `passwordHash` 字段非空
