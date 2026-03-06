-- ============================================
-- 相続税AI品質監査ツール - 初期スキーマ
-- Supabase PostgreSQL + pgvector
-- ============================================

-- pgvector拡張の有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 被相続人情報テーブル
-- ============================================
CREATE TABLE decedents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_kana TEXT,
  date_of_birth DATE,
  date_of_death DATE NOT NULL,
  address TEXT,
  last_domicile TEXT,
  occupation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 相続人情報テーブル
-- ============================================
CREATE TABLE heirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decedent_id UUID NOT NULL REFERENCES decedents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_kana TEXT,
  relationship TEXT NOT NULL, -- 配偶者, 子, 父母, 兄弟姉妹, 代襲相続人
  date_of_birth DATE,
  address TEXT,
  legal_share_ratio NUMERIC(5, 4), -- 法定相続分（例: 0.5000）
  actual_share_ratio NUMERIC(5, 4), -- 実際の相続割合
  is_minor BOOLEAN DEFAULT false,
  is_disabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 財産目録テーブル
-- ============================================
CREATE TABLE property_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decedent_id UUID NOT NULL REFERENCES decedents(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 土地, 建物, 有価証券, 預貯金, 保険金, その他
  subcategory TEXT, -- 宅地, 田, 畑, 上場株式, 非上場株式, etc.
  description TEXT NOT NULL,
  location TEXT, -- 所在地
  area_sqm NUMERIC(12, 2), -- 面積（㎡）
  quantity NUMERIC(12, 2), -- 数量（株数等）
  raw_value BIGINT, -- 申告書記載の評価額
  calculated_value BIGINT, -- AI計算の評価額
  valuation_method TEXT, -- 路線価方式, 倍率方式, 時価, etc.
  heir_id UUID REFERENCES heirs(id), -- 取得する相続人
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 評価額詳細テーブル
-- ============================================
CREATE TABLE property_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES property_inventory(id) ON DELETE CASCADE,
  valuation_type TEXT NOT NULL, -- 路線価, 倍率, 固定資産税評価, 時価, etc.
  base_value BIGINT, -- 基準値
  adjustment_factor NUMERIC(8, 4), -- 補正率
  adjustment_description TEXT, -- 補正内容（奥行補正、側方加算等）
  adjusted_value BIGINT, -- 補正後評価額
  special_provision TEXT, -- 適用特例
  reduction_rate NUMERIC(5, 4), -- 減額割合（例: 0.80）
  final_value BIGINT, -- 最終評価額
  calculation_notes TEXT, -- 計算メモ
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- アップロード書類管理テーブル
-- ============================================
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decedent_id UUID REFERENCES decedents(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, xlsx, csv
  file_size BIGINT,
  storage_path TEXT, -- Supabase Storage パス
  document_category TEXT, -- 申告書, 戸籍, 評価証明, 残高証明, etc.
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, error
  extracted_text TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ドキュメントチャンク + ベクトルテーブル
-- ============================================
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES uploaded_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small の次元数
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ベクトル検索用インデックス
CREATE INDEX ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- 監査結果テーブル
-- ============================================
CREATE TABLE audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decedent_id UUID NOT NULL REFERENCES decedents(id) ON DELETE CASCADE,
  document_id UUID REFERENCES uploaded_documents(id),
  category TEXT NOT NULL, -- valuation_error, missing_document, special_provision_risk
  severity TEXT NOT NULL, -- high, medium, low
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggestion TEXT, -- AI修正案
  reference_law TEXT, -- 参照法令
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 税法知識ベーステーブル
-- ============================================
CREATE TABLE tax_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 土地評価, 建物評価, 有価証券, 特例措置, 添付書類
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  checkpoints JSONB DEFAULT '[]', -- チェックポイント配列
  reference_law TEXT, -- 参照法令・通達
  embedding vector(1536),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 知識ベースのベクトル検索用インデックス
CREATE INDEX ON tax_knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- ============================================
-- RLS (Row Level Security) ポリシー
-- ============================================
ALTER TABLE decedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE heirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_knowledge_base ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ベクトル類似検索用の関数
-- ============================================
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  checkpoints JSONB,
  reference_law TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.category,
    kb.title,
    kb.content,
    kb.checkpoints,
    kb.reference_law,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM tax_knowledge_base kb
  WHERE kb.is_active = true
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
