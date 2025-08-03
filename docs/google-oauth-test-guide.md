# Google OAuth認証テストガイド

## 🎯 概要

Google OAuth認証フローの動作確認手順書

## 📋 前提条件

### 1. Google Cloud Console設定完了
- OAuth 2.0 Client ID作成済み
- Authorized redirect URIs設定済み:
  ```
  https://your-app-dev.auth.region.amazoncognito.com/oauth2/idpresponse
  http://localhost:4321/auth/callback
  ```
- OAuth同意画面でTest users追加済み

### 2. AWS Cognito設定完了
- Google Identity Provider設定済み
- UserPool Client設定済み

### 3. フロントエンド環境
- 環境変数設定済み（`.env`）
- 開発サーバー起動済み（ポート4321）

## 🧪 テスト手順

### Step 1: フロントエンドサーバー起動
```bash
cd frontend
npm run dev
# http://localhost:4321/ で起動確認
```

### Step 2: テストページアクセス
ブラウザで `test-port-4321.html` を開く

### Step 3: 動作確認テスト

#### 3.1 コールバックページ確認
1. **「📄 コールバックページ確認」** ボタンをクリック
2. 「🔐 Authentication Callback」ページが表示されることを確認

#### 3.2 Google OAuth認証テスト
1. **「🚀 Cognito Hosted UI テスト (4321)」** ボタンをクリック
2. Cognito Hosted UIで **「Continue with Google」** ボタンをクリック
3. Googleサインイン画面で認証実行
4. 認証完了後の動作確認：
   - `http://localhost:4321/auth/callback?code=...` にリダイレクト
   - 「✅ Authentication Successful!」メッセージ表示
   - Authorization Code表示（最初の20文字）
   - 3秒後に `http://localhost:4321/?auth=success` に自動リダイレクト

## ✅ 成功時の動作フロー

1. **Cognito Hosted UI** → Google認証画面
2. **Google認証完了** → コールバックURL（`/auth/callback?code=...`）
3. **認証成功表示** → Authorization Code表示
4. **自動リダイレクト** → メインページ（`/?auth=success`）

## 🔍 トラブルシューティング

### 問題: コールバックページが表示されない
**解決**: フロントエンドサーバーが正しいポート（4321）で起動しているか確認

### 問題: "Continue with Google"ボタンが表示されない
**解決**: 
- Cognito設定でGoogle Providerが有効か確認
- ブラウザキャッシュクリア後に再テスト

### 問題: Google認証後にエラー
**解決**:
- Google Cloud ConsoleのAuthorized redirect URIs設定確認
- OAuth同意画面のTest users設定確認

## 📊 設定確認

### 現在の設定値
- **Cognito Domain**: `your-app-dev.auth.region.amazoncognito.com`
- **UserPool ID**: `region_YourPoolId`
- **Client ID**: `your-client-id`
- **Google Client ID**: `${your-google-client-id}.apps.googleusercontent.com`
- **コールバックURL**: `http://localhost:4321/auth/callback`

### 環境変数（`.env`）
```bash
PUBLIC_API_ENDPOINT=https://your-api-id.execute-api.region.amazonaws.com/prod
PUBLIC_COGNITO_USER_POOL_ID=region_YourPoolId
PUBLIC_COGNITO_CLIENT_ID=your-client-id
PUBLIC_COGNITO_DOMAIN=your-app-dev.auth.region.amazoncognito.com
PUBLIC_FRONTEND_CALLBACK_URL=http://localhost:4321/auth/callback
```

## 🎉 テスト完了確認

Google OAuth認証フローが以下の通り動作すれば成功：
- ✅ Cognito Hosted UI表示
- ✅ Google認証画面遷移
- ✅ 認証後コールバック処理
- ✅ 成功メッセージ表示
- ✅ メインページ自動リダイレクト