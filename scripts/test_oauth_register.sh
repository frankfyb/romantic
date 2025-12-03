#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:3000}"

HTML=$(curl -sS "$BASE/api/auth/wechatmp?action=qrcode&redirect_uri=$BASE/api/auth/callback/wechatmp")
# 从脚本片段中直接提取验证码 code: 'XXXXXX'
CODE=$(echo "$HTML" | sed -n "s/.*code: '\([0-9A-Za-z_-]*\)'.*/\1/p")
if [ -z "$CODE" ]; then
  echo "FAILED: cannot extract captcha code" && exit 1
fi

OPENID="openid_$(date +%s)"

XML_PAYLOAD="<xml><ToUserName>server</ToUserName><FromUserName>$OPENID</FromUserName><CreateTime>$(date +%s)</CreateTime><MsgType>text</MsgType><Content>$CODE</Content></xml>"

# 计算合法签名（token, timestamp, nonce 排序后取 SHA1）
TOKEN=$(grep -E '^WECHAT_TOKEN=' .env | head -n1 | cut -d'=' -f2 | tr -d '"')
TS=$(date +%s)
NONCE=$(openssl rand -hex 8)
JOINED=$(printf "%s\n%s\n%s\n" "$TOKEN" "$TS" "$NONCE" | sort | tr -d '\n')
SIG=$(printf "%s" "$JOINED" | sha1sum | awk '{print $1}')

curl -sS -o /dev/null -w "%{http_code}\n" -X POST "$BASE/api/auth/wechatmp?timestamp=$TS&nonce=$NONCE&signature=$SIG" \
  -H "Content-Type: application/xml" \
  --data "$XML_PAYLOAD"

CHECK=$(curl -sS -X POST "$BASE/api/auth/wechatmp?action=check" -H "Content-Type: application/json" -d "{\"code\":\"$CODE\"}")
echo "$CHECK" | sed -n 's/.*"type"\s*:\s*"\([a-zA-Z]*\)".*/\1/p'

STATUS=$(curl -sS -o /dev/null -w "%{http_code}\n" "$BASE/api/auth/callback/wechatmp?code=$CODE")
echo "$STATUS"

SESSION=$(curl -sS "$BASE/api/auth/session")
echo "$SESSION"
