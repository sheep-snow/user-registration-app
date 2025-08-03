# アーキテクチャ設計

## スタック分割設計

### 1. CommonResourceStack
- **役割**: 環境変数・共通設定管理
- **リソース**: 環境固有の設定値
- **依存**: なし

### 2. DatabaseStack  
- **役割**: データ永続化層
- **リソース**: DynamoDB テーブル (Users, Licenses)
- **依存**: CommonResourceStack

### 3. AuthStack
- **役割**: 認証・認可システム
- **リソース**: Cognito UserPool, UserPoolClient
- **依存**: CommonResourceStack

### 4. ApiStack
- **役割**: API層・ビジネスロジック
- **リソース**: API Gateway, Lambda関数
- **依存**: CommonResourceStack, AuthStack, DatabaseStack

## 環境分離

### dev環境
- リソース名: `${appName}-${resourceType}-dev`
- 開発・テスト用設定
- コスト最適化優先

### prod環境  
- リソース名: `${appName}-${resourceType}-prod`
- 本番用設定
- 可用性・セキュリティ優先

## TypeScript専用設計

### CDK設定
- `noEmit: true`: JavaScript出力無効
- `ts-node`: TypeScript直接実行
- 型安全性の確保

### Lambda関数設計
- **Dockerイメージ**: Node.js 18 Lambdaランタイム
- **単一イメージ**: 複数ハンドラーで効率化
- **TypeScript**: 型安全性とコンパイル時チェック

### 利点
- コンパイル不要（CDK）
- 型チェックによる品質向上
- 開発効率の向上
- 大きな依存関係に対応（Docker）

## デプロイメントフロー

### 1. インフラデプロイ
```bash
cdk deploy --context env=dev --all
```
- CloudFormationスタック作成
- Dockerイメージ自動ビルド・ECRプッシュ
- Lambda関数デプロイ

### 2. 設定更新
```bash
# 環境変数更新後
cdk deploy --context env=dev --all
```
- 変更分のみ更新
- ゼロダウンタイムデプロイ

## モニタリング

### CloudWatch Logs
- Lambda関数ログ自動収集
- API Gatewayアクセスログ
- DynamoDBメトリクス

### パフォーマンス
- Lambda初期化: 2.4秒（Docker初回起動）
- Lambda実行: 100-150ms
- DynamoDB: オンデマンドモード