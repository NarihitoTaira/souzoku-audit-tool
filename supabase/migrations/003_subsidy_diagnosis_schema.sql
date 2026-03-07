-- ============================================
-- 003: 補助金採択可能性診断ツール - 新スキーマ
-- ============================================
-- 事業再構築補助金、ものづくり補助金、IT導入補助金、
-- 小規模事業者持続化補助金などの採択可能性を診断するためのテーブル群

-- ============================================
-- 診断対象企業テーブル（マルチテナント対応）
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID, -- 将来的なクライアント管理用（士業が複数企業を管理する場合）
  company_name TEXT NOT NULL,
  representative_name TEXT,
  industry TEXT, -- 業種
  employee_count INTEGER,
  capital_amount BIGINT, -- 資本金（円）
  annual_revenue BIGINT, -- 年商（円）
  address TEXT,
  established_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 補助金診断テーブル
-- ============================================
CREATE TABLE subsidy_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  client_id UUID, -- 将来のマルチクライアント対応
  subsidy_name TEXT NOT NULL, -- 事業再構築補助金, ものづくり補助金, etc.
  business_plan_text TEXT, -- 事業計画書のテキスト
  guidelines_text TEXT, -- 公募要項のテキスト
  diagnosis_status TEXT DEFAULT 'pending', -- pending, processing, completed, error
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 診断結果テーブル
-- ============================================
CREATE TABLE diagnosis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID NOT NULL REFERENCES subsidy_diagnoses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- スコア（各20点満点、合計100点満点）
  innovation_score INTEGER DEFAULT 0,     -- 革新性・差別化
  feasibility_score INTEGER DEFAULT 0,    -- 実現可能性
  market_score INTEGER DEFAULT 0,         -- 市場分析
  profitability_score INTEGER DEFAULT 0,  -- 収益計画
  policy_alignment_score INTEGER DEFAULT 0, -- 政策適合性
  total_score INTEGER DEFAULT 0,          -- 合計スコア
  adoption_probability TEXT,              -- A/B/C/D ランク

  -- 指摘事項と改善案（JSONB）
  findings JSONB DEFAULT '[]',
  -- findingsの構造:
  -- [{
  --   "category": "weak_point | missing_element | structure_issue",
  --   "severity": "high | medium | low",
  --   "title": "指摘タイトル",
  --   "description": "指摘内容",
  --   "suggestion": "改善提案",
  --   "expected_score_impact": "+10〜15点",
  --   "reference": "参照基準"
  -- }]

  -- 総合評価
  overall_assessment TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 事業計画書チャンク（RAG用）
-- ============================================
CREATE TABLE business_plan_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID NOT NULL REFERENCES subsidy_diagnoses(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ベクトル検索用インデックス
CREATE INDEX ON business_plan_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- 補助金ナレッジベーステーブル
-- ============================================
CREATE TABLE subsidy_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_name TEXT NOT NULL, -- 事業再構築補助金, ものづくり補助金, etc.
  category TEXT NOT NULL, -- 事業計画の妥当性, 市場の新規性, etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  checkpoints JSONB DEFAULT '[]',
  scoring_criteria TEXT,
  max_points INTEGER DEFAULT 0,
  tips TEXT,
  embedding vector(1536),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 知識ベースのベクトル検索用インデックス
CREATE INDEX ON subsidy_knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- ============================================
-- インデックス追加
-- ============================================
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_client_id ON companies(client_id);
CREATE INDEX idx_subsidy_diagnoses_user_id ON subsidy_diagnoses(user_id);
CREATE INDEX idx_subsidy_diagnoses_client_id ON subsidy_diagnoses(client_id);
CREATE INDEX idx_diagnosis_results_user_id ON diagnosis_results(user_id);
CREATE INDEX idx_diagnosis_results_diagnosis_id ON diagnosis_results(diagnosis_id);

-- ============================================
-- RLS (Row Level Security) ポリシー
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plan_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_knowledge_base ENABLE ROW LEVEL SECURITY;

-- === companies ===
CREATE POLICY "ユーザーは自分の企業のみ参照可能"
  ON companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の企業のみ作成可能"
  ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の企業のみ更新可能"
  ON companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の企業のみ削除可能"
  ON companies FOR DELETE USING (auth.uid() = user_id);

-- === subsidy_diagnoses ===
CREATE POLICY "ユーザーは自分の診断のみ参照可能"
  ON subsidy_diagnoses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の診断のみ作成可能"
  ON subsidy_diagnoses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の診断のみ更新可能"
  ON subsidy_diagnoses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の診断のみ削除可能"
  ON subsidy_diagnoses FOR DELETE USING (auth.uid() = user_id);

-- === diagnosis_results ===
CREATE POLICY "ユーザーは自分の診断結果のみ参照可能"
  ON diagnosis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の診断結果のみ作成可能"
  ON diagnosis_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ユーザーは自分の診断結果のみ更新可能"
  ON diagnosis_results FOR UPDATE USING (auth.uid() = user_id);

-- === business_plan_chunks（診断経由で制御） ===
CREATE POLICY "ユーザーは自分のチャンクのみ参照可能"
  ON business_plan_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subsidy_diagnoses
      WHERE subsidy_diagnoses.id = business_plan_chunks.diagnosis_id
      AND subsidy_diagnoses.user_id = auth.uid()
    )
  );
CREATE POLICY "ユーザーは自分のチャンクのみ作成可能"
  ON business_plan_chunks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subsidy_diagnoses
      WHERE subsidy_diagnoses.id = business_plan_chunks.diagnosis_id
      AND subsidy_diagnoses.user_id = auth.uid()
    )
  );

-- === subsidy_knowledge_base（全ユーザーが参照可能） ===
CREATE POLICY "全ユーザーが補助金ナレッジを参照可能"
  ON subsidy_knowledge_base FOR SELECT USING (true);

-- ============================================
-- ベクトル類似検索用の関数
-- ============================================
CREATE OR REPLACE FUNCTION match_business_plan_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  diagnosis_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bpc.id,
    bpc.diagnosis_id,
    bpc.content,
    bpc.metadata,
    1 - (bpc.embedding <=> query_embedding) AS similarity
  FROM business_plan_chunks bpc
  WHERE 1 - (bpc.embedding <=> query_embedding) > match_threshold
  ORDER BY bpc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_subsidy_knowledge(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  subsidy_name TEXT,
  category TEXT,
  title TEXT,
  content TEXT,
  checkpoints JSONB,
  scoring_criteria TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sk.id,
    sk.subsidy_name,
    sk.category,
    sk.title,
    sk.content,
    sk.checkpoints,
    sk.scoring_criteria,
    1 - (sk.embedding <=> query_embedding) AS similarity
  FROM subsidy_knowledge_base sk
  WHERE sk.is_active = true
    AND 1 - (sk.embedding <=> query_embedding) > match_threshold
  ORDER BY sk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
