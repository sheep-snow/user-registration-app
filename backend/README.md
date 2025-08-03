# Backend Lambda Functions

Docker イメージベースのLambda関数実装

## 構成

### Lambda関数
- **create-payment-session**: Stripe決済セッション作成
- **get-licenses**: ユーザーライセンス取得
- **stripe-webhook**: Stripe Webhook処理・ライセンス生成

### Docker設計
- Node.js 18 Lambda ランタイム
- TypeScript → JavaScript コンパイル
- 単一Dockerイメージ、複数ハンドラー

## ビルド・デプロイ

```bash
# TypeScriptビルド
npm run build

# CDKデプロイ（Dockerイメージ自動ビルド）
cd ../infrastructure
cdk deploy --context env=dev --all
```

## 環境変数

| 変数名 | 説明 |
|---|---|
| USERS_TABLE | DynamoDB Usersテーブル名 |
| LICENSES_TABLE | DynamoDB Licensesテーブル名 |
| STRIPE_SECRET_KEY | Stripe シークレットキー |
| STRIPE_WEBHOOK_SECRET | Stripe Webhook シークレット |