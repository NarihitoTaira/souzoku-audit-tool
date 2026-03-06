/**
 * 相続税AI品質監査ツール - RAGパイプライン
 *
 * PDFテキスト抽出 → チャンク分割 → ベクトル化 → 検索
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

      // オーバーラップ: 前のチャンクの末尾を次のチャンクの先頭に含める
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
 * PDFテキストから構造化データを抽出する（簡易版）
 */
export function extractStructuredData(text: string): {
  decedentName?: string;
  properties: string[];
  amounts: string[];
} {
  const lines = text.split("\n").filter((l) => l.trim());

  // 金額パターンの検出
  const amountRegex = /[¥￥]?\s*[\d,]+(?:\s*(?:円|万円))?/g;
  const amounts = text.match(amountRegex) || [];

  // 財産種別のキーワード検出
  const propertyKeywords = [
    "土地",
    "宅地",
    "建物",
    "家屋",
    "預貯金",
    "株式",
    "有価証券",
    "保険金",
    "退職手当",
  ];
  const properties = propertyKeywords.filter((kw) => text.includes(kw));

  return {
    properties,
    amounts,
  };
}
