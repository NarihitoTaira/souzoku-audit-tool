-- ============================================
-- 002: マルチテナント対応（user_id + RLSポリシー）
-- ============================================
-- このマイグレーションはすべてのテーブルに user_id を追加し、
-- ログインユーザーが自分のデータのみアクセスできるようにします。

-- ============================================
-- user_id カラムの追加
-- ============================================

ALTER TABLE decedents
  ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id);

ALTER TABLE uploaded_documents
  ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id);

ALTER TABLE audit_results
  ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id);

-- heirs, property_inventory, property_valuations, document_chunks は
-- 親テーブル経由で間接的にユーザーに紐づくため、直接 user_id は不要
-- （RLSは親テーブルの JOIN で制御）

-- ============================================
-- インデックス追加
-- ============================================

CREATE INDEX idx_decedents_user_id ON decedents(user_id);
CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX idx_audit_results_user_id ON audit_results(user_id);

-- ============================================
-- RLSポリシーの設定
-- ============================================

-- === decedents（被相続人情報） ===
CREATE POLICY "ユーザーは自分のデータのみ参照可能"
  ON decedents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のデータのみ作成可能"
  ON decedents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のデータのみ更新可能"
  ON decedents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のデータのみ削除可能"
  ON decedents FOR DELETE
  USING (auth.uid() = user_id);

-- === heirs（相続人情報）: 親の decedent を通じて制御 ===
CREATE POLICY "ユーザーは自分の被相続人に紐づく相続人のみ参照可能"
  ON heirs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = heirs.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の被相続人に相続人を追加可能"
  ON heirs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = heirs.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の被相続人の相続人のみ更新可能"
  ON heirs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = heirs.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の被相続人の相続人のみ削除可能"
  ON heirs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = heirs.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

-- === property_inventory（財産目録）: 親の decedent を通じて制御 ===
CREATE POLICY "ユーザーは自分の財産目録のみ参照可能"
  ON property_inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = property_inventory.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の財産目録のみ作成可能"
  ON property_inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = property_inventory.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の財産目録のみ更新可能"
  ON property_inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = property_inventory.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の財産目録のみ削除可能"
  ON property_inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decedents
      WHERE decedents.id = property_inventory.decedent_id
      AND decedents.user_id = auth.uid()
    )
  );

-- === property_valuations（評価額詳細）: property_inventory → decedent 経由 ===
CREATE POLICY "ユーザーは自分の評価額のみ参照可能"
  ON property_valuations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM property_inventory pi
      JOIN decedents d ON d.id = pi.decedent_id
      WHERE pi.id = property_valuations.property_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分の評価額のみ作成可能"
  ON property_valuations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_inventory pi
      JOIN decedents d ON d.id = pi.decedent_id
      WHERE pi.id = property_valuations.property_id
      AND d.user_id = auth.uid()
    )
  );

-- === uploaded_documents（アップロード書類） ===
CREATE POLICY "ユーザーは自分のアップロード書類のみ参照可能"
  ON uploaded_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のアップロード書類のみ作成可能"
  ON uploaded_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のアップロード書類のみ更新可能"
  ON uploaded_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のアップロード書類のみ削除可能"
  ON uploaded_documents FOR DELETE
  USING (auth.uid() = user_id);

-- === document_chunks（チャンク）: uploaded_documents 経由 ===
CREATE POLICY "ユーザーは自分のチャンクのみ参照可能"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM uploaded_documents
      WHERE uploaded_documents.id = document_chunks.document_id
      AND uploaded_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分のチャンクのみ作成可能"
  ON document_chunks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM uploaded_documents
      WHERE uploaded_documents.id = document_chunks.document_id
      AND uploaded_documents.user_id = auth.uid()
    )
  );

-- === audit_results（監査結果） ===
CREATE POLICY "ユーザーは自分の監査結果のみ参照可能"
  ON audit_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の監査結果のみ作成可能"
  ON audit_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の監査結果のみ更新可能"
  ON audit_results FOR UPDATE
  USING (auth.uid() = user_id);

-- === tax_knowledge_base（税法ナレッジ）: 全ユーザーが参照可能 ===
CREATE POLICY "全ユーザーが税法ナレッジを参照可能"
  ON tax_knowledge_base FOR SELECT
  USING (true);
