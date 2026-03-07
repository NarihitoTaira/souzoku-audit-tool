-- ============================================
-- 005: 本番稼働用スキーマ（統合版）
-- BYOK + 利用制限 + 管理者 + 診断テーブル群
-- ============================================
-- ※ 003/004を実行していない環境でもこれ1つで動作します

-- pgvector拡張（既に有効なら無視）
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 診断対象企業テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID,
  company_name TEXT NOT NULL,
  representative_name TEXT,
  industry TEXT,
  employee_count INTEGER,
  capital_amount BIGINT,
  annual_revenue BIGINT,
  address TEXT,
  established_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_client_id ON companies(client_id);

-- ============================================
-- 補助金診断テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS subsidy_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  client_id UUID,
  subsidy_name TEXT NOT NULL,
  business_plan_text TEXT,
  guidelines_text TEXT,
  diagnosis_status TEXT DEFAULT 'completed',
  total_score INTEGER DEFAULT 0,
  adoption_rank TEXT,
  scores JSONB DEFAULT '{}',
  findings JSONB DEFAULT '[]',
  summary JSONB DEFAULT '{}',
  api_key_source TEXT DEFAULT 'platform',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subsidy_diagnoses_user_id ON subsidy_diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_subsidy_diagnoses_client_id ON subsidy_diagnoses(client_id);

-- ============================================
-- ユーザープロファイル（BYOK + 利用制限 + 管理者）
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  user_api_key TEXT,
  monthly_diagnosis_count INTEGER DEFAULT 0,
  monthly_reset_at TIMESTAMPTZ DEFAULT date_trunc('month', now()) + interval '1 month',
  max_monthly_diagnoses INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ユーザー登録時に自動でプロファイルを作成
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ============================================
-- 診断ログ（監査・管理用）
-- ============================================
CREATE TABLE IF NOT EXISTS diagnosis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  diagnosis_id UUID,
  api_key_source TEXT NOT NULL DEFAULT 'platform',
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  input_tokens INTEGER,
  output_tokens INTEGER,
  duration_ms INTEGER,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diagnosis_logs_user_id ON diagnosis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_logs_created_at ON diagnosis_logs(created_at);

-- ============================================
-- アップロード文書テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extracted_text TEXT,
  category TEXT DEFAULT 'business_plan',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_user_id ON uploaded_documents(user_id);

-- ============================================
-- お問い合わせテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- companies
DO $$ BEGIN
  CREATE POLICY "companies_select" ON companies FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "companies_update" ON companies FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "companies_delete" ON companies FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- subsidy_diagnoses
DO $$ BEGIN
  CREATE POLICY "diagnoses_select" ON subsidy_diagnoses FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "diagnoses_insert" ON subsidy_diagnoses FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "diagnoses_update" ON subsidy_diagnoses FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "diagnoses_delete" ON subsidy_diagnoses FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_profiles
DO $$ BEGIN
  CREATE POLICY "profiles_select" ON user_profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- diagnosis_logs
DO $$ BEGIN
  CREATE POLICY "logs_select" ON diagnosis_logs FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "logs_insert" ON diagnosis_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- uploaded_documents
DO $$ BEGIN
  CREATE POLICY "docs_select" ON uploaded_documents FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "docs_insert" ON uploaded_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "docs_delete" ON uploaded_documents FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- inquiries
DO $$ BEGIN
  CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- 関数
-- ============================================

-- 診断カウントのインクリメント
CREATE OR REPLACE FUNCTION increment_diagnosis_count(target_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET monthly_diagnosis_count = monthly_diagnosis_count + 1,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 月次リセット関数
CREATE OR REPLACE FUNCTION reset_monthly_diagnosis_counts()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET monthly_diagnosis_count = 0,
      monthly_reset_at = date_trunc('month', now()) + interval '1 month',
      updated_at = now()
  WHERE monthly_reset_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
