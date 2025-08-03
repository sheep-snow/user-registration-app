# セットアップガイド

## 📋 初期設定手順

### 1. 環境変数設定

```bash
cd infrastructure
cp cdk.env.example cdk.env
```

`cdk.env`を編集：
```bash
APP_NAME=user-registration-app
CDK_DEFAULT_ACCOUNT=123456789012  # あなたのAWSアカウントID
CDK_DEFAULT_REGION=ap-northeast-1

# 以下は後で設定（初回デプロイ時は空でOK）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FRONTEND_CALLBACK_URL=http://localhost:4321/auth/callback
LOGLEVEL=INFO
```

### 2. インフラデプロイ

```bash
# CDKブートストラップ（初回のみ）
cdk bootstrap

# 全スタックデプロイ
cdk deploy --context env=dev --all --require-approval never
```

**デプロイ完了後に表示される情報をメモ：**
- API Gateway エンドポイント
- Cognito UserPool ID
- Cognito Client ID

### 3. Google OAuth設定

#### 3.1 Google Cloud Console設定
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト作成または選択
3. 「APIs & Services」→「Credentials」
4. 「Create Credentials」→「OAuth 2.0 Client IDs」
5. Application type: Web application
6. Authorized redirect URIs:
   ```
   https://your-cognito-domain.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse
   ```

#### 3.2 Cognito Identity Provider設定
```bash
# Cognito UserPoolにGoogle Identity Providerを追加
aws cognito-idp create-identity-provider \
  --user-pool-id ap-northeast-1_XXXXXXXXX \
  --provider-name Google \
  --provider-type Google \
  --provider-details client_id=YOUR_GOOGLE_CLIENT_ID,client_secret=YOUR_GOOGLE_CLIENT_SECRET,authorize_scopes="openid email profile" \
  --attribute-mapping email=email,name=name
```

#### 3.3 OAuth Domain設定
```bash
# Cognito OAuth Domainを作成
aws cognito-idp create-user-pool-domain \
  --domain your-app-name-dev \
  --user-pool-id ap-northeast-1_XXXXXXXXX
```

### 4. Stripe設定

#### 4.1 Stripe Dashboard設定
1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. 「Developers」→「API keys」から公開キー・秘密キーを取得
3. 「Developers」→「Webhooks」でWebhook作成
4. Endpoint URL: `https://your-api-gateway-url/prod/webhook/stripe`
5. Events: `payment_intent.succeeded`

#### 4.2 環境変数更新
```bash
# cdk.envを更新
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# 再デプロイ
cdk deploy --context env=dev --all
```

### 5. フロントエンド設定

#### 5.1 環境変数設定
```bash
cd frontend
cp .env.example .env
```

`.env`を編集：
```bash
PUBLIC_API_ENDPOINT=https://your-api-gateway-url/prod
PUBLIC_COGNITO_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
PUBLIC_COGNITO_CLIENT_ID=your-cognito-client-id
PUBLIC_COGNITO_DOMAIN=your-app-name-dev.auth.ap-northeast-1.amazoncognito.com
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PUBLIC_FRONTEND_CALLBACK_URL=http://localhost:4321/auth/callback
```

**注意**: ポート番号は実際の開発サーバーに合わせて設定

#### 5.2 セキュリティ注意
- `.env`ファイルはGitにコミットしない
- 本番環境では適切な環境変数管理を実施

## 🧪 動作確認

### 1. Google OAuth認証テスト
```bash
# フロントエンドサーバー起動
cd frontend
npm run dev
# http://localhost:4321/ で起動確認
```

ブラウザで `google-oauth-test.html` を開いてテスト実行

### 2. 統合テスト実行
```bash
# バックエンドテスト
node test-integration.js

# フロントエンドテスト
# http://localhost:4321/test にアクセス
```

### 3. エンドツーエンドテスト
1. `http://localhost:4321`にアクセス
2. 「Sign in with Google」をクリック
3. Google認証完了後、ダッシュボード表示確認
4. 「Purchase License」で決済フロー確認
5. ライセンス生成・表示確認

## 🚀 本番デプロイ

### 1. 本番環境デプロイ
```bash
# 本番用環境変数設定
cp cdk.env cdk.prod.env
# cdk.prod.envを本番用に編集

# 本番デプロイ
cdk deploy --context env=prod --all
```

### 2. フロントエンド本番デプロイ
```bash
cd frontend
npm run build

# S3 + CloudFrontでの配信設定
# （別途CDKスタック作成推奨）
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. CDKデプロイエラー
```bash
# ブートストラップ確認
cdk bootstrap --show-template

# 権限確認
aws sts get-caller-identity
```

#### 2. Lambda関数エラー
```bash
# ログ確認
aws logs tail /aws/lambda/FUNCTION_NAME --follow
```

#### 3. 認証エラー
- Cognito設定確認
- Google OAuth設定確認
- リダイレクトURL確認

#### 4. 決済エラー
- Stripe Webhook URL確認
- Webhook署名確認
- API Gateway CORS設定確認

## 📚 参考情報

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Stripe Documentation](https://stripe.com/docs)
- [Astro Documentation](https://docs.astro.build/)