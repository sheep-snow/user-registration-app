# API リファレンス

## ベースURL
```
https://your-api-id.execute-api.region.amazonaws.com/prod
```

## 認証
認証が必要なエンドポイントはCognito JWTトークンをAuthorizationヘッダーに含める：
```
Authorization: Bearer <JWT_TOKEN>
```

## エンドポイント

### 🔐 POST /payment/create-session
決済セッションを作成

**認証**: 必要

**リクエスト**:
```json
{}
```

**レスポンス**:
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

**エラー**:
```json
{
  "error": "Unauthorized"
}
```

### 🔐 GET /licenses
ユーザーのライセンス一覧を取得

**認証**: 必要

**レスポンス**:
```json
{
  "licenses": [
    {
      "licenseId": "uuid",
      "licenseCode": "LIC-1234567890-ABCDEFGHI",
      "purchaseDate": "2024-01-01T00:00:00.000Z",
      "paymentIntentId": "pi_xxx"
    }
  ]
}
```

### 🌐 POST /webhook/stripe
Stripe Webhook処理

**認証**: 不要（Stripe署名検証）

**ヘッダー**:
```
stripe-signature: t=xxx,v1=xxx
```

**リクエスト**:
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "metadata": {
        "userId": "cognito-user-id"
      }
    }
  }
}
```

**レスポンス**:
```json
{
  "received": true
}
```

## エラーレスポンス

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "error": "Missing stripe signature"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## CORS設定
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD`
- `Access-Control-Allow-Headers: Content-Type,Authorization`

## レート制限
- API Gateway標準制限適用
- Lambda同時実行数制限適用

## データベーススキーマ

### Users テーブル
```json
{
  "userId": "cognito-user-id",
  "stripeCustomerId": "cus_xxx",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Licenses テーブル
```json
{
  "licenseId": "uuid",
  "userId": "cognito-user-id",
  "licenseCode": "LIC-1234567890-ABCDEFGHI",
  "purchaseDate": "2024-01-01T00:00:00.000Z",
  "paymentIntentId": "pi_xxx"
}
```

## 統合テスト

### テストエンドポイント
```bash
# Webhook テスト
curl -X POST https://your-api/webhook/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 認証テスト
curl -X GET https://your-api/licenses
```

### 期待レスポンス
- Webhook: `{"error":"Missing stripe signature"}`
- 認証: `{"message":"Unauthorized"}`