## 范围与前提

* 仅使用 NextAuth 暴露的接口进行非UI（curl）测试，不新增任何自定义 API 端点

* 数据库与 PrismaAdapter 已配置；会话策略为 `jwt`

## 接口与可测能力说明

* Credentials 登录：`/api/auth/callback/password`（POST，表单编码，需要 CSRF）

* 获取 CSRF：通过 `GET /api/auth/signin` 页面解析隐藏字段；或 `GET /api/auth/csrf`（若当前版本启用）

* Session 查询：`GET /api/auth/session`（需要携带登录后 Cookie）

* OAuth（微信）：

  * 发起：`GET /api/auth/signin/wechatmp` -> 302 跳转到授权端点

  * 微信消息回调握手：`GET /api/auth/wechatmp?signature=...&timestamp=...&nonce=...&echostr=...` -> 200 + echostr

  * 完整 OAuth 登录（创建用户）需要真实微信环境生成 `code/state`，测试环境中仅能验证流程入口与握手，不保证用户创建

* 密码重置：NextAuth 本身不提供“重置请求/确认”端点；仅能通过登录行为验证新旧密码有效性（前提是密码已被更新）

## 测试用例设计（NextAuth 语义适配）

### A. 注册（通过 OAuth 发起与回调握手的可测范围）

* 发起授权：`GET /api/auth/signin/wechatmp` 期望 302（Location 指向授权端点）

* 回调握手：`GET /api/auth/wechatmp?...` 期望 200（原样回显 `echostr`）

* 说明：完整的“新用户创建/重复注册/邮箱格式/弱密码”这些精确 HTTP 码（200/409/400/422）不属于 NextAuth 默认语义；重复注册由 Adapter & 唯一约束控制，通常返回 302 到成功页或错误页，不以 409 显式返回。此处将通过数据库侧验证“只创建一条用户记录且不重复”。

### B. 登录（Credentials Provider：id 为 `password`）

* 成功登录：

  1. 获取 CSRF：`GET /api/auth/signin` 提取隐藏 `csrfToken`
  2. `POST /api/auth/callback/password`，`Content-Type: application/x-www-form-urlencoded`，Body 含 `csrfToken`, `phone`, `password`
  3. 期望 302 到成功页；随后 `GET /api/auth/session` 返回 200 JSON（含用户自定义字段）

* 错误密码：同上流程，期望 302 到 `error` 页（`?error=CredentialsSignin`），或 401（取决于版本与配置）；随后 `GET /api/auth/session` 未登录

* 不存在用户：同上流程，期望 302 到 `error` 页（或 404 不存在用户日志），`/api/auth/session` 未登录

* 账户锁定：连续错误 N 次后，再次登录期望 302 到 `error`（或 403 语义），并在数据库中记录锁定标记/失败次数（按现有实现而定）

### C. 密码重置（基于 NextAuth 能力的可测范围）

* 由于未提供“请求重置/确认重置”的 NextAuth 端点，测试将验证：

  * 已更新密码后：`/api/auth/callback/password` 使用新密码登录成功（302+session 200）

  * 旧密码登录失败（302 error 或 401）

* 若需要“重置链接有效期/过期 403”等，用例将以数据库 `VerificationToken` 记录与日志验证为准（接口层不返回 403）

## 测试数据

* 邮箱：`userNN@test.example.com`（仅用于数据库侧核对）

* 手机：`1390000NNNN`

* 密码：强密码 `Test!2345abc`；弱密码 `123456`

* 每用例独立数据，避免串扰

## 执行方法（curl 脚本提示）

* 统一使用 CookieJar 持久化：`curl -c jar.txt -b jar.txt ...`

* 提取 CSRF（示例）：

```bash
curl -sS -c jar.txt -b jar.txt http://localhost:3000/api/auth/signin | grep -oP 'name="csrfToken" value="\K[^"]+'
```

* 登录成功脚本片段：

```bash
CSRF=$(curl -sS -c jar.txt -b jar.txt $BASE/api/auth/signin | grep -oP 'name="csrfToken" value="\K[^"]+')
curl -sS -L -c jar.txt -b jar.txt -X POST $BASE/api/auth/callback/password \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode csrfToken=$CSRF \
  --data-urlencode phone=13900000001 \
  --data-urlencode password=Test!2345abc
curl -sS -c jar.txt -b jar.txt $BASE/api/auth/session
```

* 错误密码/不存在用户：修改 `password` 或 `phone` 重复上述流程，断言重定向 Location 含 `error` 参数；`/api/auth/session` 未登录

## 验证标准

* HTTP：

  * 登录成功：302 + `/api/auth/session` 200（含自定义字段）

  * 登录失败：302（`?error=...`）或 401；`/api/auth/session` 未登录

  * OAuth 发起：302；握手：200 回显

* 数据库：

  * 用户创建不重复（`User` 与 `Account` 按 `@@unique`）

  * 密码更新后哈希变更；失败次数/锁定标志按实现存在

* 日志：

  * 记录登录成功/失败、OAuth 发起与握手；审计可定位到用户与操作类型

## 交付物

* 可复用脚本：

  * `scripts/nextauth-login-success.sh`

  * `scripts/nextauth-login-failed.sh`

  * `scripts/nextauth-oauth-handshake.sh`

* 测试报告：通过/失败统计 + 关键响应与数据库核对

* 缺陷列表：若发现行为与预期不匹配（例如需 409/422 但 NextAuth 语义为重定向），将记录并给出建议

## 说明与限制

* 使用 NextAuth 原生接口时，“注册重复（409）、无效邮箱（400）、弱密码（422）、过期链接（403）”这类精确状态码并非其标准返回模式；NextAuth以重定向与错误码字符串为主，需要通过数据库与日志侧验证对应语义。

* 若后续需要严格对齐这些状态码，可在不影响 NextAuth 的情况下新增轻量 API 适配层；本方案按你要求暂不新增端点。

## 下一步

* 如确认以上方案，我将编写并运行上述 curl 脚本，采集结果与数据库/日志核对，生成报告与缺陷列表。

