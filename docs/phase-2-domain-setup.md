# Phase 2: ドメイン対応実装

## 🎯 目標
Cloudflareドメインのサブドメイン（`app.example.com`）をAWSで利用し、フロントエンド配信インフラを構築

## 📋 実装内容

### Phase A: インフラ準備（60分）
1. **Route53ホストゾーン作成**
2. **SSL証明書取得（ACM）**
3. **フロントエンド配信CDKスタック作成**
   - S3バケット（静的サイトホスティング）
   - CloudFront Distribution
   - Route53 Aレコード

### Phase B: DNS設定（30分 + 伝播待ち）
1. **Cloudflare DNS委譲設定**
2. **証明書検証完了確認**

### Phase C: アプリ設定更新（30分）
1. **Cognito・Google OAuth設定更新**
2. **環境変数・CORS設定更新**
3. **動作確認**

## 🚀 Phase A開始: インフラ準備

### 必要な情報
Phase 2実装に必要な情報をお教えください：

1. **使用するドメイン名**
   - 例: `app.example.com`
   - Cloudflareで管理されているドメイン

2. **環境設定**
   - 開発環境: `app-dev.example.com`
   - 本番環境: `app.example.com`

### 実装手順
1. **Route53ホストゾーン作成**
2. **SSL証明書リクエスト**
3. **フロントエンド配信スタック実装**

## ⏱️ 所要時間
- **Phase A**: 60分（インフラ実装）
- **Phase B**: 30分 + DNS伝播待ち（1-2時間）
- **Phase C**: 30分（設定更新）

使用するドメイン名をお知らせください。Phase A（インフラ準備）を開始いたします！