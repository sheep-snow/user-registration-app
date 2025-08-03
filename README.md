# User Registration App

Googleアカウントでのサインイン機能を備えたライセンス販売Webサービス

## 概要

ユーザーがGoogleアカウントでサインインし、決済を通じてライセンスコードを取得できるサーバーレスWebサービス。

## 🚀 クイックスタート

### 前提条件
- AWS CLI設定済み
- Node.js 18+
- Docker（Lambda用）

### 1. リポジトリクローン
```bash
git clone <repository-url>
cd user-ragistration-app
```

### 2. インフラデプロイ
```bash
cd infrastructure
npm install
cp cdk.env.example cdk.env
# cdk.envを編集（後述の設定項目参照）
cdk bootstrap
cdk deploy --context env=dev --all
```

### 3. フロントエンド起動
```bash
cd ../frontend
npm install
cp .env.example .env
# .envを編集（ドメイン名等を設定）
npm run dev
# http://localhost:4321
```

## アーキテクチャ

| コンポーネント | 技術 | 役割 |
|---|---|---|
| フロントエンド | Astro | UI・管理画面 |
| 認証 | Amazon Cognito | Google OIDC認証 |
| API | API Gateway | セキュアなAPIルーティング |
| バックエンド | AWS Lambda | ビジネスロジック (TypeScript) |
| データベース | DynamoDB | データ永続化 (オンデマンド) |
| 決済 | Stripe | クレジットカード決済 |

## 主要機能

### 1. 認証
- Cognito + Google OIDC
- JWT認証でAPI保護

### 2. 決済・ライセンス発行
- Stripe決済セッション作成
- Webhook経由でライセンス生成
- DynamoDBにライセンス保存

### 3. ライセンス管理
- 認証済みユーザーのライセンス表示

## データベース設計

### Users テーブル
- `userId` (PK): CognitoユーザーID
- `stripeCustomerId`: Stripe顧客ID
- `createdAt`: 作成日時

### Licenses テーブル
- `licenseId` (PK): ライセンスID
- `userId` (GSI): ユーザーID
- `licenseCode`: ライセンスコード
- `purchaseDate`: 購入日時

## プロジェクト構造

```
├── infrastructure/    # AWS CDK (TypeScript専用)
│   ├── lib/
│   │   ├── common-resource-stack.ts  # 共通設定・環境変数管理
│   │   ├── database-stack.ts         # DynamoDB
│   │   ├── auth-stack.ts             # Cognito
│   │   ├── api-stack.ts              # API Gateway + Lambda
│   │   └── frontend-stack.ts         # S3 + CloudFront + Route53
│   ├── cdk.env                       # 環境変数（実在ドメイン）
│   └── cdk.env.example               # 環境変数テンプレート
├── backend/          # Lambda関数 (Docker)
├── frontend/         # Astro
│   ├── src/lib/auth.ts           # Cognito認証
│   ├── src/lib/stripe.ts         # Stripe決済
│   ├── src/pages/                # ページコンポーネント
│   ├── .env                      # フロントエンド環境変数
│   └── .env.example              # 環境変数テンプレート
└── docs/            # ドキュメント
```

## 開発方針

- **コスト効率**: サーバーレス構成
- **スケーラビリティ**: オンデマンド課金
- **セキュリティ**: JWT認証・Stripe決済
- **最小実装**: 必要最小限のコード
- **環境分離**: dev/prod環境の完全分離
- **TypeScript専用**: CDKはTypeScriptのみ使用
- **Docker Lambda**: Lambda関数はDockerイメージでデプロイ

## 📚 ドキュメント

### 🏆 プロジェクト概要
- **[features.md](docs/features.md)** - 実装済み機能詳細
- **[roadmap.md](docs/roadmap.md)** - 今後の開発ロードマップ

### 技術ドキュメント
- **[setup-guide.md](docs/setup-guide.md)** - 詳細なセットアップ手順
- **[deployment.md](docs/deployment.md)** - デプロイメントガイド
- **[api-reference.md](docs/api-reference.md)** - APIリファレンス
- **[architecture.md](docs/architecture.md)** - アーキテクチャ設計
- **[troubleshooting.md](docs/troubleshooting.md)** - トラブルシューティング
- **[google-oauth-test-guide.md](docs/google-oauth-test-guide.md)** - Google OAuth認証テスト

## 🏆 プロジェクト完成

### ✅ MVP完成 - 商用レベル機能
- **Google OAuth認証**: 両環境（ローカル・カスタムドメイン）完全動作
- **Stripe決済統合**: テスト実装・ライセンス自動生成
- **Webアプリケーション**: Astroアプリ・エンドツーエンド動作
- **スケーラブルインフラ**: サーバーレス・コスト効率・自動スケール

### 🎆 完成したWebアプリケーション
```bash
# ローカル開発環境
cd frontend && npm run dev
# http://localhost:4321/

# カスタムドメイン
# https://app.yourdomain.com/

# 完全動作フロー
# 1. Sign in with Google → 認証成功
# 2. ダッシュボード表示 → Purchase License
# 3. テスト成功メッセージ表示
```

### 設定確認
```bash
# 環境確認
aws sts get-caller-identity
cdk list --context env=dev

# フロントエンド起動
cd frontend && npm run dev
# http://localhost:4321/
```

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照