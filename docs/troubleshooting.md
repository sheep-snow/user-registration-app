# トラブルシューティング

## 🚨 よくある問題と解決方法

### CDKデプロイエラー

#### 1. ブートストラップエラー
```bash
Error: Need to perform AWS CDK bootstrap
```

**解決方法**:
```bash
cdk bootstrap
```

#### 2. 権限エラー
```bash
Error: User is not authorized to perform: sts:AssumeRole
```

**解決方法**:
```bash
# AWS認証情報確認
aws sts get-caller-identity

# 必要な権限: AdministratorAccess または CDK用カスタムポリシー
```

#### 3. リージョンエラー
```bash
Error: Cannot determine region
```

**解決方法**:
```bash
# cdk.envでリージョン設定確認
CDK_DEFAULT_REGION=ap-northeast-1

# または環境変数設定
export AWS_DEFAULT_REGION=ap-northeast-1
```

### Lambda関数エラー

#### 1. Docker関連エラー
```bash
Error: Failed to build Docker image
```

**解決方法**:
```bash
# Dockerデーモン起動確認
docker ps

# backend/distディレクトリ存在確認
cd backend && npm run build
```

#### 2. 実行時エラー
```bash
Error: Cannot find module
```

**解決方法**:
```bash
# Lambda関数ログ確認
aws logs tail /aws/lambda/FUNCTION_NAME --follow

# 依存関係確認
cd backend && npm install
```

### 認証エラー

#### 1. Cognito設定エラー
```bash
Error: Invalid client configuration
```

**解決方法**:
```bash
# UserPool・Client ID確認
aws cognito-idp list-user-pools --max-items 10
aws cognito-idp list-user-pool-clients --user-pool-id YOUR_POOL_ID

# frontend/src/lib/auth.tsの設定確認
```

#### 2. Google OAuth エラー
```bash
Error: invalid_client
```

**解決方法**:
1. Google Cloud Console設定確認
2. リダイレクトURI設定確認
3. Cognito Identity Provider設定確認

### 決済エラー

#### 1. Stripe Webhook エラー
```bash
Error: Invalid signature
```

**解決方法**:
```bash
# Webhook署名確認
# Stripe Dashboard → Webhooks → Signing secret

# 環境変数確認
echo $STRIPE_WEBHOOK_SECRET
```

#### 2. 公開キーエラー
```bash
Error: Invalid publishable key
```

**解決方法**:
```bash
# frontend/src/lib/stripe.tsの設定確認
# Stripe Dashboard → API keysから公開キー取得
```

### API接続エラー

#### 1. CORS エラー
```bash
Error: CORS policy blocked
```

**解決方法**:
- API GatewayのCORS設定確認
- プリフライトリクエスト対応確認

#### 2. 認証エラー
```bash
Error: Unauthorized
```

**解決方法**:
```bash
# JWTトークン確認
# ブラウザ開発者ツール → Network → Authorization header

# Cognito Authorizer設定確認
```

## 🔍 デバッグ方法

### 1. ログ確認
```bash
# Lambda関数ログ
aws logs tail /aws/lambda/FUNCTION_NAME --follow

# API Gatewayログ（有効化が必要）
aws logs tail /aws/apigateway/API_ID --follow
```

### 2. DynamoDB確認
```bash
# テーブル状態確認
aws dynamodb describe-table --table-name TABLE_NAME

# アイテム確認
aws dynamodb scan --table-name TABLE_NAME --limit 5
```

### 3. 統合テスト実行
```bash
# バックエンドテスト
node test-integration.js

# フロントエンドテスト
# http://localhost:4321/test
```

## 📞 サポート情報

### 1. ログ収集
問題報告時は以下の情報を含める：
- エラーメッセージ全文
- 実行したコマンド
- 環境情報（OS、Node.js版、AWS CLI版）
- Lambda関数ログ

### 2. 設定確認コマンド
```bash
# 環境確認
node --version
aws --version
cdk --version

# AWS設定確認
aws configure list
aws sts get-caller-identity

# デプロイ状態確認
cdk list --context env=dev
```

### 3. クリーンアップ
```bash
# 全リソース削除
cdk destroy --context env=dev --all --force

# Docker イメージクリーンアップ
docker system prune -a
```