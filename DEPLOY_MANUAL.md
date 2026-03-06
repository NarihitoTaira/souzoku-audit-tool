# 🚀 本番公開マニュアル

以下の手順で、無料で本番環境を構築・公開できます。

---

## ステップ 1: Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) にアクセスし、GitHubアカウントでサインアップ
2. 「**New Project**」をクリック
3. 以下を入力:
   - **Project Name**: `souzoku-audit` （任意）
   - **Database Password**: 安全なパスワードを設定（後で使用）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 「**Create new project**」をクリック（作成に2分ほどかかります）

### APIキーの確認

1. プロジェクトダッシュボードの左メニュー「⚙️ **Project Settings**」→「**API**」を開く
2. 以下の2つの値をメモしておく：
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon / public** キー: `eyJ...` で始まる文字列

---

## ステップ 2: データベースのセットアップ

1. Supabase ダッシュボードの左メニュー「**SQL Editor**」を開く
2. 「**New query**」をクリック

### マイグレーション 1: テーブル作成

3. `supabase/migrations/001_initial_schema.sql` の中身を **全てコピー** して SQL Editor に貼り付け
4. 「**Run**」をクリック（緑色の ✓ が表示されればOK）

### マイグレーション 2: マルチテナント (RLS)

5. 「**New query**」をクリック
6. `supabase/migrations/002_rls_multitenant.sql` の中身を **全てコピー** して貼り付け
7. 「**Run**」をクリック

> ✅ これでデータベースのテーブル作成と、ユーザーごとのデータ分離（RLS）が完了です

---

## ステップ 3: Supabase 認証の設定

1. ダッシュボードの「**Authentication**」→「**Providers**」を開く
2. 「**Email**」が有効（Enabled）になっていることを確認
3. 「**Authentication**」→「**URL Configuration**」を開く
4. 以下を設定:
   - **Site URL**: `https://あなたのVercel URL`（ステップ5でデプロイ後に設定）
   - **Redirect URLs**: `https://あなたのVercel URL/auth/callback` を追加

---

## ステップ 4: Google Gemini API キーの取得

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. Googleアカウントでログイン
3. 「**APIキーを作成**」をクリック
4. 生成されたキー（`AIza...` で始まる文字列）をメモ

> 💡 無料枠: 1日1,500リクエスト（初期利用には十分です）

---

## ステップ 5: Vercel へのデプロイ

### 5-1. GitHub にプッシュ

1. GitHubにリポジトリを作成（Private推奨: `souzoku-audit-tool`）
2. ターミナルで以下を実行:

```bash
cd "c:\Users\USER\Desktop\新しいフォルダー"
git init
git add .
git commit -m "初期リリース: 相続税AI品質監査ツール"
git remote add origin https://github.com/あなたのユーザー名/souzoku-audit-tool.git
git push -u origin main
```

### 5-2. Vercel でデプロイ

1. [vercel.com](https://vercel.com) にアクセスし、GitHubアカウントでサインアップ
2. 「**Add New...**」→「**Project**」をクリック
3. 先ほどのGitHubリポジトリ（`souzoku-audit-tool`）を選択
4. **Framework Preset**: `Next.js` が自動検出されます
5. 「**Environment Variables**」に以下を設定:

| 変数名 | 値 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ステップ1でメモした Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ステップ1でメモした anon key |
| `GOOGLE_AI_API_KEY` | ステップ4で取得した Gemini API キー |
| `AI_PROVIDER` | `gemini` |

6. 「**Deploy**」をクリック

> 🎉 デプロイ完了後、Vercelが自動で URL を発行します（例: `souzoku-audit-tool.vercel.app`）

---

## ステップ 6: Supabase の認証URLを更新

1. Supabase ダッシュボードの「**Authentication**」→「**URL Configuration**」に戻る
2. 以下を設定:
   - **Site URL**: `https://あなたのアプリ名.vercel.app`
   - **Redirect URLs**: `https://あなたのアプリ名.vercel.app/auth/callback`

---

## ✅ 公開完了！

公開URLにアクセスし、「**新規登録**」からアカウントを作成してログインしてください。

### 料金について（すべて無料枠内）

| サービス | 無料枠 |
|---|---|
| **Vercel** | 月100GBデータ転送、無制限デプロイ |
| **Supabase** | 500MB DB、50,000ユーザー、5GB帯域幅 |
| **Gemini API** | 1日1,500リクエスト |

### トラブルシューティング

| 症状 | 対処法 |
|---|---|
| ログイン後に白い画面 | Vercelの環境変数を再確認 |
| 「Invalid API key」エラー | Supabase の anon key を再確認 |
| AI監査が動かない | Gemini API キーを確認・`.env`の `AI_PROVIDER=gemini` を確認 |
| 確認メールが届かない | Supabase Auth → Email Templates を確認 |
