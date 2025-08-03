# API設計

## 認証
- **方式**: Cognito JWT (Authorization ヘッダー)
- **プロバイダー**: Google OIDC

## エンドポイント

### 1. 決済準備
- **POST** `/api/payment/create-session`
- **認証**: 必要
- **レスポンス**: `{ clientSecret: string }`

### 2. ライセンス取得
- **GET** `/api/licenses`
- **認証**: 必要
- **レスポンス**: `{ licenses: License[] }`

### 3. Stripe Webhook
- **POST** `/api/webhook/stripe`
- **認証**: Stripe署名検証
- **処理**: ライセンス生成・保存

## データ型

```typescript
interface User {
  userId: string;
  stripeCustomerId: string;
  createdAt: string;
}

interface License {
  licenseId: string;
  userId: string;
  licenseCode: string;
  purchaseDate: string;
}
```