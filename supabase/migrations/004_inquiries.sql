-- ============================================
-- 004: お問い合わせテーブル
-- ============================================

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  -- general: 一般, bug: 不具合, feature: 機能リクエスト, data: 個人情報請求, billing: 料金
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  -- new: 新規, in_progress: 対応中, resolved: 解決済み
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のお問い合わせのみ参照可能
CREATE POLICY "ユーザーは自分の問い合わせを参照可能"
  ON inquiries FOR SELECT USING (auth.uid() = user_id);

-- ログインユーザーは問い合わせを作成可能
CREATE POLICY "ユーザーは問い合わせを作成可能"
  ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
