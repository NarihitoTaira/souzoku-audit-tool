/**
 * 中小企業向け補助金・採択可能性診断ツール - RAGパイプライン
 *
 * 事業計画書PDF テキスト抽出 → チャンク分割 → ベクトル化 → 検索
 */

import { getEmbedding } from "./ai-client";

/**
 * テキストをチャンクに分割する
 * オーバーラップ付きでコンテキストを保持
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[。\n]/);
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + trimmed).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      const words = currentChunk.split("");
      const overlapText = words.slice(-overlap).join("");
      currentChunk = overlapText + trimmed + "。";
    } else {
      currentChunk += trimmed + "。";
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * チャンクをベクトル化する
 */
export async function embedChunks(
  chunks: string[]
): Promise<{ content: string; embedding: number[] }[]> {
  const results = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    results.push({ content: chunk, embedding });
  }
  return results;
}

/**
 * コサイン類似度を計算する（ローカルフォールバック用）
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * ローカルのチャンクデータから類似検索（Supabase未接続時のフォールバック）
 */
export function localSearch(
  query: string,
  chunks: { content: string; embedding: number[] }[],
  queryEmbedding: number[],
  topK: number = 5
): { content: string; similarity: number }[] {
  const results = chunks
    .map((chunk) => ({
      content: chunk.content,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return results;
}

/**
 * 事業計画書テキストから構造化データを抽出する
 */
export function extractStructuredData(text: string): {
  companyName?: string;
  businessItems: string[];
  financialFigures: string[];
  keywords: string[];
} {
  const lines = text.split("\n").filter((l) => l.trim());

  // 金額パターンの検出
  const amountRegex = /[¥￥]?\s*[\d,]+(?:\s*(?:円|万円|百万円|億円))?/g;
  const financialFigures = text.match(amountRegex) || [];

  // 事業計画書のキーワード検出
  const businessKeywords = [
    "売上",
    "利益",
    "投資",
    "設備",
    "雇用",
    "DX",
    "デジタル",
    "GX",
    "グリーン",
    "革新",
    "差別化",
    "市場",
    "顧客",
    "ターゲット",
    "競合",
    "特許",
    "知的財産",
    "生産性",
    "付加価値",
    "人材",
    "研修",
    "SDGs",
    "サプライチェーン",
    "省エネ",
    "脱炭素",
    "EC",
    "クラウド",
    "AI",
    "IoT",
    "ロボット",
  ];
  const keywords = businessKeywords.filter((kw) => text.includes(kw));

  // 事業関連項目の検出
  const businessItemKeywords = [
    "事業計画",
    "経営計画",
    "販路開拓",
    "新製品開発",
    "業務効率化",
    "人材育成",
    "設備投資",
    "IT導入",
    "事業再構築",
    "事業転換",
    "新分野展開",
  ];
  const businessItems = businessItemKeywords.filter((kw) => text.includes(kw));

  return {
    businessItems,
    financialFigures,
    keywords,
  };
}
