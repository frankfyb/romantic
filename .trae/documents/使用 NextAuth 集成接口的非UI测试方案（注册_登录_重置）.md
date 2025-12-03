## 测试范围与目标

* 覆盖用户注册（通过 NextAuth OAuth 首次登录自动建用户）、账号密码登录（Credentials Provider）、密码重置（基于 VerificationToken）

* 仅使用 NextAuth 暴露的接口进行 HTTP 非UI测试（curl）

* 产出脚本、报告、数据库/日志核对与缺陷列表

## 环境与端点

* 基础 URL：`http://localhost:3000`

* NextAuth 端点：

  * 注册（OAuth 首次登录）：`/api/auth/callback/wechatmp`

  * 账号密码登录：`/api/auth/callback/password`

  * Session 查询：`/api/auth/session`

  * 退出登录：`/api/auth/signout`

* 插件内部消息端点（供 OAuth 流程用）：`/api/auth/wechatmp`（与配置的 `AUTH_WECHATMP_ENDPOINT` 一致）

## 关键假设

* 首次 OAuth 登录将通过 PrismaAdapter 自动创建 `User` 数据（等价于“注册成功”）

* WeChatMP Provider 在测试环境可通过其 `token` 步骤模拟，令 `tokens.access_token` 作为 `openid` 注入（其 `userinfo.request` 将返回 `{ openid: tokens.access_token }`）

* 账号密码登录走 Credentials Provider：`POST /api/auth/callback/password`，提交 `phone` 和 `password`

## 测试用例与脚本

### 1. 注册测试（OAuth 首次登录自动建用户）

* 成功（200）：模拟一个全新的 `openid` 完成 OAuth 回调，期望创建用户并返回 200/302（NextAuth 重定向登录页）

* 重复注册（409）：以同一 `openid` 再次发起，期望不重复创建（验证 DB 仅一条记录）

* 无效邮箱格式（400）：不适用于 OAuth 流程，改为“无效 openid”（返回 400/401），记录为替代负例

* 弱密码规则（422）：不适用于 OAuth；在登录场景用 Credentials 进行负例验证

* 脚本（示例）：

```bash
#!/usr/bin/env bash
BASE="http://localhost:3000"
OPENID_NEW="openid_test_$(date +%s)"

# 模拟 OAuth 回调的 token 步骤（插件将基于 endpoint 返回 tokens）
# 注意：具体参数取决于插件实现，若无法直接注入，改用两步：先访问 endpoint 获取二维码/状态，再触发 token。
# 这里以最简化的假设示例展示：

# 回调：首次登录（等价注册）
curl -sS -D - "$BASE/api/auth/callback/wechatmp?action=token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "access_token=$OPENID_NEW" -o /dev/null

# 查询 Session 验证已登录并创建用户
curl -sS "$BASE/api/auth/session"
```

* 预期：回调返回 200/302，`/api/auth/session` 有用户信息；DB 中有新用户记录（`User.wechatOpenId == OPENID_NEW`）

### 2. 登录测试（Credentials Provider）

* 正确凭据（200+token/cookie）：

```bash
BASE="http://localhost:3000"
PHONE="13900000001"
PASS_OK="Test!2345abc"

curl -sS -D - -o /dev/null -w "%{http_code}\n" \
  -X POST "$BASE/api/auth/callback/password" \
  -H "Content-Type: application/json" \
  -d '{"phone":"'$PHONE'","password":"'$PASS_OK'"}'
```

* 错误密码（401）：同上，将 `password` 改为错误值

* 不存在的用户（404）：使用未注册手机号

* 账户锁定（403）：连续失败 5 次后，再次尝试返回 403（如果实现了锁定策略；否则记录为缺陷）

### 3. 密码重置（NextAuth 集成流程）

* 请求重置（200+重置链接）：

  * 触发方式：在现有实现中通过 WeChatMP 流程发放验证码；非UI测试中可直接检查 `VerificationToken` 表是否生成对应记录

* 重置链接有效期（过期后403）：构造过期令牌（或等待 TTL），确认返回 403

* 确认新密码生效（可登录）与旧密码失效（无法登录）：

  * 用 Credentials Provider 分别尝试新旧密码登录，预期新密码 200，旧密码 401

* 脚本（确认登录）：

```bash
BASE="http://localhost:3000"
PHONE="13900000001"
NEW_PASS="New!2345abc"
OLD_PASS="Test!2345abc"

# 新密码登录
curl -sS -o /dev/null -w "%{http_code}\n" \
  -X POST "$BASE/api/auth/callback/password" \
  -H "Content-Type: application/json" \
  -d '{"phone":"'$PHONE'","password":"'$NEW_PASS'"}'

# 旧密码登录
curl -sS -o /dev/null -w "%{http_code}\n" \
  -X POST "$BASE/api/auth/callback/password" \
  -H "Content-Type: application/json" \
  -d '{"phone":"'$PHONE'","password":"'$OLD_PASS'"}'
```

## 验证标准

* HTTP 状态码与响应体符合预期

* DB 一致性：

  * `User`：首次 OAuth 登录新增用户，重复不新增

  * `VerificationToken`：重置流程生成、过期/使用后状态变化

* 日志：

  * `next-development.log` 中有对应认证流程日志和错误消息

  * 若启用事件审计（NextAuth callbacks/events），检查包含用户与操作类型

## 报告与交付

* 生成测试报告（通过/失败统计、异常响应、DB 验证截图/输出）

* 提交可复用脚本（注册/登录/重置）

* 缺陷列表：未实现或不符合预期的用例（例如账户锁定策略缺失、重置接口不可直接触发等）

## 执行说明（得到你的确认后）

1. 编写并运行上述 curl 脚本（含 OAuth 首次登录模拟与 Credentials 登录）
2. 使用 psql/日志核对数据库记录与流程日志
3. 汇总并生成报告与缺陷列表

