/**
 * 補助金採択可能性診断ツール - AIクライアント（BYOK対応）
 *
 * APIキーの優先順位: ユーザーBYOKキー → プラットフォームキー → モック
 */

import { SYSTEM_PROMPT } from "./prompts";

export interface DiagnosisFinding {
  category: "weak_point" | "missing_element" | "structure_issue";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestion: string;
  expected_score_impact: string;
  reference: string;
}

export interface DiagnosisScores {
  innovation_score: number;
  feasibility_score: number;
  market_score: number;
  profitability_score: number;
  policy_alignment_score: number;
  total_score: number;
  adoption_probability: string;
}

export interface DiagnosisResponse {
  findings: DiagnosisFinding[];
  scores: DiagnosisScores;
  summary: {
    total_findings: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    overall_assessment: string;
  };
}

// モック診断レスポンス（APIキー未設定時のフォールバック）
const MOCK_DIAGNOSIS_RESPONSE: DiagnosisResponse = {
  findings: [
    {
      category: "weak_point",
      severity: "high",
      title: "市場分析の定量的根拠が不足",
      description: "ターゲット市場の規模について具体的なデータ（TAM/SAM/SOM）や公的統計の引用がありません。",
      suggestion: "経済産業省「工業統計」や矢野経済研究所等の市場調査レポートを引用し、市場規模を数値化してください。",
      expected_score_impact: "+10〜15点",
      reference: "審査項目3：市場分析・顧客ニーズ",
    },
    {
      category: "missing_element",
      severity: "high",
      title: "補助事業終了後の自走計画が未記載",
      description: "補助金交付期間終了後の事業継続計画が記載されていません。不採択リスクが非常に高くなります。",
      suggestion: "補助事業終了後3〜5年の売上・利益計画と、補助金なしでの事業継続方法を明記してください。",
      expected_score_impact: "+10〜12点",
      reference: "審査項目4：収益計画・費用対効果",
    },
    {
      category: "structure_issue",
      severity: "medium",
      title: "実施体制の具体性が不足",
      description: "各フェーズの担当者・外部連携先・専門人材の確保計画が不明確です。",
      suggestion: "実施体制図を作成し、社内担当者の役割と外部パートナーとの連携体制を具体的に記載してください。",
      expected_score_impact: "+5〜8点",
      reference: "審査項目2：事業の実現可能性",
    },
  ],
  scores: {
    innovation_score: 12,
    feasibility_score: 13,
    market_score: 8,
    profitability_score: 10,
    policy_alignment_score: 11,
    total_score: 54,
    adoption_probability: "C",
  },
  summary: {
    total_findings: 3,
    high_count: 2,
    medium_count: 1,
    low_count: 0,
    overall_assessment:
      "現状の事業計画書は採択可能性Cランク（54/100点）です。市場分析の定量根拠と自走計画の欠如が致命的な弱点です。改善により75〜85点への引き上げが見込めます。",
  },
};

/**
 * Gemini API呼び出し（カスタムキー対応）
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * 補助金採択可能性診断を実行（BYOK対応）
 * @param prompt - 診断プロンプト
 * @param apiKey - 使用するAPIキー（BYOKまたはプラットフォーム）
 */
export async function runDiagnosis(
  prompt: string,
  apiKey?: string
): Promise<DiagnosisResponse> {
  const key = apiKey || process.env.GOOGLE_AI_API_KEY;

  if (!key) {
    console.warn("No API key available, returning mock response");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_DIAGNOSIS_RESPONSE;
  }

  try {
    const responseText = await callGemini(prompt, key);
    return JSON.parse(responseText) as DiagnosisResponse;
  } catch (error) {
    console.error("AI diagnosis error, falling back to mock:", error);
    return MOCK_DIAGNOSIS_RESPONSE;
  }
}

/**
 * APIキーの接続テスト
 */
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "こんにちは。接続テストです。「OK」とだけ返してください。" }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 10 },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 400) return { valid: false, error: "APIキーの形式が無効です" };
      if (response.status === 403) return { valid: false, error: "APIキーが無効またはアクセス権限がありません" };
      return { valid: false, error: `API error: ${response.status}` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "接続に失敗しました。ネットワークを確認してください。" };
  }
}

/**
 * テキスト埋め込みベクトルを取得
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });

  if (!response.ok) throw new Error(`Embedding API error: ${response.status}`);
  const data = await response.json();
  return data.data[0].embedding;
}
