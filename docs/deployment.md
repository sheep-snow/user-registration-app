# デプロイメント

## 前提条件
- AWS CLI設定済み
- Node.js 18+
- AWS CDK CLI

## 環境変数
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## デプロイ手順

### 1. 初回セットアップ
```bash
cd infrastructure
npm install
cp cdk.env.example cdk.env
# cdk.envでAWSアカウントID・リージョンを設定

# CDKブートストラップ（初回のみ）
cdk bootstrap
```

### 2. インフラデプロイ
```bash
# dev環境デプロイ
cdk deploy --context env=dev --all --require-approval never

# デプロイ後に表示されるAPIエンドポイントをメモ
```

### 3. 外部サービス設定
```bash
# Google OAuth・Stripe設定後、環境変数更新
# cdk.envでGOOGLE_CLIENT_ID、STRIPE_SECRET_KEY等を設定

# 再デプロイ
cdk deploy --context env=dev --all
```

### 4. フロントエンド起動
```bash
cd ../frontend
npm install
npm run dev
# http://localhost:4321
```

### 2. フロントエンド
```bash
cd frontend
npm install
npm run build
# S3/CloudFrontにデプロイ
```

## スタック構成
- **CommonResourceStack**: 環境変数・共通設定
- **DatabaseStack**: DynamoDBテーブル (オンデマンド)
- **AuthStack**: Cognitoユーザープール
- **ApiStack**: API Gateway + Lambda関数

## 設定項目
- Cognito: Google OIDCプロバイダー設定
- API Gateway: Cognitoオーソライザー
- DynamoDB: オンデマンドモード
- Stripe: Webhookエンドポイント登録
- TypeScript: JavaScriptファイル非生成