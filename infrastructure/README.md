# Infrastructure

AWS CDKを使用したインフラストラクチャ定義

## 構成

### スタック分割
- **CommonResourceStack**: 共通設定・環境変数管理
- **DatabaseStack**: DynamoDB テーブル (Users, Licenses)
- **AuthStack**: Cognito 認証システム  
- **ApiStack**: API Gateway + Lambda関数

### TypeScript専用設計
- JavaScript出力無効 (`noEmit: true`)
- `ts-node`でTypeScript直接実行
- 型安全性とコンパイル不要を両立

### 環境管理
- `cdk.env`: 環境変数設定ファイル
- `--context env=dev|prod`: ステージ指定
- リソース名: `${appName}-${resourceType}-${stage}`
- 完全な環境分離

## デプロイ

```bash
# 環境変数設定
cp cdk.env.example cdk.env
# 必要な値を設定

# dev環境デプロイ
cdk deploy --context env=dev --all
cdk deploy --context env=dev --all --require-approval never


# prod環境デプロイ
cdk deploy --context env=prod --all
cdk deploy --context env=prod --all --require-approval never
```

## 環境変数

| 変数名                | 説明                          |
| --------------------- | ----------------------------- |
| APP_NAME              | アプリケーション名            |
| GOOGLE_CLIENT_ID      | Google OAuth クライアントID   |
| STRIPE_SECRET_KEY     | Stripe シークレットキー       |
| FRONTEND_CALLBACK_URL | フロントエンドコールバックURL |