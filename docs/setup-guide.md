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

# Domain Settings
DOMAIN_NAME=app.yourdomain.com
FRONTEND_DOMAIN=https://app.yourdomain.com
```

### 2. インフラデプロイ

```bash
# CDKブートストラップ（初回のみ）
cdk bootstrap

# 全スタックデプロイ
cdk deploy --context env=dev --all --require-approval never
```

**デプロイ完了後に表示される情報をメモ：**
- API Gateway Endpoint URL
- Cognito UserPool ID
- Cognito Client ID

### 3. Google OAuth設定

#### 3.1 Cognito OAuth Domain作成
**まず、CognitoのOAuth Domainを作成します：**
```bash
# Cognito OAuth Domainを作成（アプリ名ベースのユニークな名前を指定）
# 注意: これはCognitoが自動生成するサブドメインのプレフィックスです
aws cognito-idp create-user-pool-domain \
  --domain user-registration-app-dev \
  --user-pool-id ap-northeast-1_XXXXXXXXX
```

**作成したドメインを確認：**
```bash
# 作成されたドメインを確認
aws cognito-idp describe-user-pool-domain --domain user-registration-app-dev
```

**重要**: `--domain`で指定する値は、Cognitoが自動生成するサブドメインのプレフィックスです。
最終的なCognito認証URLは `https://user-registration-app-dev.auth.ap-northeast-1.amazoncognito.com` になります。

#### 3.2 Google Cloud Console設定
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト作成または選択
3. 「APIs & Services」→「Credentials」
4. 「Create Credentials」→「OAuth 2.0 Client IDs」
5. Application type: Web application
6. Authorized redirect URIs:
   ```
   https://user-registration-app-dev.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse
   ```
   **注意**: `user-registration-app-dev`は上記で作成したCognito OAuth Domainのプレフィックスです
   **注意**: クライアント IDとクライアントシークレットが発行されるのでメモしておく

#### 3.3 Cognito Identity Provider設定
```bash
# Cognito UserPoolにGoogle Identity Providerを追加
aws cognito-idp create-identity-provider \
  --user-pool-id ap-northeast-1_XXXXXXXXX \
  --provider-name Google \
  --provider-type Google \
  --provider-details client_id=YOUR_GOOGLE_CLIENT_ID,client_secret=YOUR_GOOGLE_CLIENT_SECRET,authorize_scopes="openid email profile" \
  --attribute-mapping email=email,name=name
```

#### 3.4 UserPoolClientにGoogleプロバイダーを関連付け
**重要**: Identity Providerを作成した後、UserPoolClientにサポートされるプロバイダーとしてGoogleを追加する必要があります。

```bash
# UserPoolClientにGoogleプロバイダーを追加
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-northeast-1_XXXXXXXXX \
  --client-id your-cognito-client-id \
  --supported-identity-providers COGNITO Google \
  --callback-urls "http://localhost:4321/auth/callback" \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client
```



### 4. Stripe設定

#### 4.1 Stripe Dashboard設定
1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. 「Developers」→「API keys」から公開キー・秘密キーを取得
3. 「Developers」→「Webhooks」でWebhook作成
4. Endpoint URL: **手順2でデプロイ時に表示されたAPI Gateway Endpoint URL** + `/webhook/stripe`
   ```
   例: https://abcd1234.execute-api.ap-northeast-1.amazonaws.com/prod/webhook/stripe
   ```
   **注意**: `https://your-api-gateway-url`の部分は、手順2のCDKデプロイ完了時に表示された「API Gateway エンドポイント」の値を使用してください
5. Events: `payment_intent.succeeded`

#### 4.2 環境変数更新

# cdk.envを更新
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

# 再デプロイ
```bash
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
PUBLIC_COGNITO_DOMAIN=user-registration-app-dev.auth.ap-northeast-1.amazoncognito.com
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PUBLIC_FRONTEND_CALLBACK_URL=http://localhost:4321/auth/callback
```

**注意**: ポート番号は実際の開発サーバーに合わせて設定

#### 5.2 セキュリティ注意
- `.env`ファイルはGitにコミットしない
- 本番環境では適切な環境変数管理を実施

## 🧪 動作確認

**⚠️ 重要**: 以下のテストは、手順1-5（特に手順3のGoogle OAuth設定）を完了してから実行してください。

### 1. Google OAuth認証テスト
**前提条件**: 手順3.1-3.3のGoogle OAuth設定が完了していること

```bash
# フロントエンドサーバー起動
cd frontend
npm run dev
# http://localhost:4321/ で起動確認
```

1. ブラウザで `http://localhost:4321/` にアクセス
2. 「Sign in with Google」ボタンをクリック
3. Google認証フローが正常に動作することを確認

**エラー「username is required to signIn」が出る場合**:
- 手順3.1: Cognito OAuth Domainが作成されているか確認
- 手順3.2: Google Cloud ConsoleでOAuth 2.0 Client IDが作成されているか確認
- 手順3.3: Cognito Identity ProviderにGoogleが追加されているか確認
- 手順4.2: 環境変数が更新され、再デプロイが完了しているか確認

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

#### 4. 認証後にダッシュボードが表示されない
**症状**: Google認証は成功するが、ダッシュボードが一瞬表示されてサインイン画面に戻る
**原因**: `signInWithRedirect`使用時のAmplify認証状態チェックの問題
**解決**: URLパラメータ（`?auth=success`または`code`）で認証成功を検出する処理が必要

#### 5. 決済エラー
- Stripe Webhook URL確認
- Webhook署名確認
- API Gateway CORS設定確認

## 📚 参考情報

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Stripe Documentation](https://stripe.com/docs)
- [Astro Documentation](https://docs.astro.build/)