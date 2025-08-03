# Frontend - Astro Application

Googleアカウント認証とStripe決済機能を備えたWebアプリケーション

## 構成

### ページ
- **/** - メインダッシュボード（認証・決済・ライセンス管理）
- **/auth/callback** - OAuth認証コールバック
- **/payment/success** - 決済成功ページ

### ライブラリ
- **auth.ts** - Cognito認証・API呼び出し
- **stripe.ts** - Stripe決済処理

## 設定が必要な項目

### 1. 環境変数設定
```bash
# .env.exampleをコピー
cp .env.example .env

# .envを編集
PUBLIC_API_ENDPOINT=https://your-api-gateway-url/prod
PUBLIC_COGNITO_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
PUBLIC_COGNITO_CLIENT_ID=your-cognito-client-id
PUBLIC_COGNITO_DOMAIN=your-app-name.auth.region.amazoncognito.com
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
PUBLIC_FRONTEND_CALLBACK_URL=http://localhost:4321/auth/callback
```

### 2. セキュリティ
- `.env`ファイルはGit管理対象外
- 本番環境では適切な環境変数設定が必要

## 開発・デプロイ

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview
```

## 機能

### 認証フロー
1. Google OAuth経由でCognito認証
2. JWTトークンでAPI認証
3. セッション管理

### 決済フロー
1. 認証済みユーザーが決済セッション作成
2. Stripe Elements で安全な決済処理
3. Webhook経由でライセンス自動生成

### ライセンス管理
- 認証済みユーザーのライセンス一覧表示
- リアルタイム更新機能