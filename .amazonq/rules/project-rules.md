# プロジェクトルール

## 技術スタック
- **フロントエンド**: Astro
- **バックエンド**: AWS Lambda (TypeScript)
- **インフラ**: AWS CDK (TypeScript)
- **データベース**: DynamoDB (オンデマンド)
- **認証**: Amazon Cognito + Google OIDC
- **決済**: Stripe

## コーディング規約
- TypeScriptを使用 (CDKはTypeScript専用)
- 最小限の実装を心がける
- セキュリティベストプラクティスに従う
- サーバーレス構成を維持
- JavaScriptファイルは生成しない
- スタック間の依存関係を明確化
- Lambda関数はDockerイメージでデプロイ

## ドキュメント管理ルール
- コード変更時は関連ドキュメントを自動更新
- API設計、アーキテクチャ、デプロイ手順の整合性を維持
- 新機能追加時はREADME、API設計、ルールを更新
- デプロイメントガイドは初心者が実行可能なレベルで維持

## ドメイン管理ルール
- 実在ドメインはGitリポジトリに含めない
- 環境変数ファイルでドメイン管理
- コード内は架空ドメイン `app.yourdomain.com` を使用
- テンプレートファイル (.example) でサンプル提供

## アーキテクチャ原則
- コスト効率を重視
- スケーラブルな設計
- 認証・認可の適切な実装
- エラーハンドリングの徹底
- 環境分離の徹底 (dev/prod)
- スタック分割で保守性を確保

## 🏆 プロジェクト最終完成状態
- **全Phase完了**: Phase 1-3 完全達成・商用レベルMVP完成
- **エンドツーエンド動作**: Google OAuth認証・Stripe決済テスト成功
- **両環境完全対応**: ローカル開発・カスタムドメイン統一動作
- **商用展開準備**: スケーラブルインフラ・セキュリティ完備
- **最終整理完了**: 不要ファイル除去・ドキュメント完備

## ファイル構成
- `infrastructure/`: CDKコード (TypeScript専用)
  - `lib/common-resource-stack.ts`: 共通設定・環境変数管理
  - `lib/database-stack.ts`: DynamoDBテーブル
  - `lib/auth-stack.ts`: Cognito認証
  - `lib/api-stack.ts`: API Gateway + Lambda
  - `lib/frontend-stack.ts`: S3 + CloudFront + Route53
  - `cdk.env`: 環境変数設定 (実在ドメイン)
  - `cdk.env.example`: 環境変数テンプレート (架空ドメイン)
- `backend/`: Lambda関数 (Docker)
- `frontend/`: Astroアプリ
  - `src/lib/auth.ts`: Cognito認証・API呼び出し
  - `src/lib/stripe.ts`: Stripe決済処理
  - `src/pages/`: ページコンポーネント
  - `.env`: フロントエンド環境変数 (架空ドメイン)
  - `.env.example`: 環境変数テンプレート
- `docs/`: 技術ドキュメント