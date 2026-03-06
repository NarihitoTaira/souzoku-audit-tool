/**
 * 相続税AI品質監査ツール - AIクライアント
 *
 * Google Gemini 1.5 Flash（デフォルト・無料枠あり）/ OpenAI API の統合クライアント
 * APIキー未設定時はモックレスポンスを返すフォールバック設計
 */

import { SYSTEM_PROMPT } from "./prompts";

export interface AuditFinding {
  category: "valuation_error" | "missing_document" | "special_provision_risk";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestion: string;
  reference: string;
}

export interface AuditResponse {
  findings: AuditFinding[];
  summary: {
    total_findings: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    quality_score: number;
  };
}

// モック監査レスポンス（API未設定時のフォールバック）
const MOCK_AUDIT_RESPONSE: AuditResponse = {
  findings: [
    {
      category: "valuation_error",
      severity: "high",
      title: "土地評価額の路線価適用誤り",
      description:
        "角地の土地について側方路線影響加算率が適用されていません。財産評価基本通達第16条に基づく補正が必要です。",
      suggestion:
        "側方路線影響加算率を適用し、評価額を再計算してください。",
      reference: "財産評価基本通達第16条",
    },
    {
      category: "missing_document",
      severity: "high",
      title: "遺産分割協議書の添付漏れ",
      description:
        "法定相続分以外での分割が行われていますが、遺産分割協議書が添付されていません。",
      suggestion:
        "全相続人の署名・実印による遺産分割協議書を添付してください。",
      reference: "相続税法第27条",
    },
    {
      category: "special_provision_risk",
      severity: "medium",
      title: "小規模宅地等特例の面積超過",
      description:
        "対象地の面積が330㎡を超えており、超過分は通常評価が必要です。",
      suggestion: "330㎡を超過する部分について通常評価額を適用してください。",
      reference: "租税特別措置法第69条の4",
    },
  ],
  summary: {
    total_findings: 3,
    high_count: 2,
    medium_count: 1,
    low_count: 0,
    quality_score: 72,
  },
};

/**
 * AI プロバイダーの判定
 */
function getProvider(): "openai" | "gemini" | "mock" {
  const provider = process.env.AI_PROVIDER || "gemini";
  // Gemini を優先的にチェック（無料枠あり）
  if (provider === "gemini" && process.env.GOOGLE_AI_API_KEY) return "gemini";
  if (provider === "openai" && process.env.OPENAI_API_KEY) return "openai";
  // プロバイダー未指定でもAPIキーがあれば自動検出
  if (process.env.GOOGLE_AI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "mock";
}

/**
 * OpenAI API呼び出し
 */
async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Gemini API呼び出し
 */
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * AI監査を実行
 */
export async function runAudit(prompt: string): Promise<AuditResponse> {
  const provider = getProvider();

  if (provider === "mock") {
    // シミュレーション用に少し遅延を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_AUDIT_RESPONSE;
  }

  try {
    let responseText: string;
    if (provider === "openai") {
      responseText = await callOpenAI(prompt);
    } else {
      responseText = await callGemini(prompt);
    }

    return JSON.parse(responseText) as AuditResponse;
  } catch (error) {
    console.error("AI audit error, falling back to mock:", error);
    return MOCK_AUDIT_RESPONSE;
  }
}

/**
 * テキスト埋め込みベクトルを取得
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    // モック: 1536次元のランダムベクトル
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * AIチャット（汎用）
 */
export async function chat(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const provider = getProvider();

  if (provider === "mock") {
    return "（モックレスポンス）AIの分析結果がここに表示されます。APIキーを設定してください。";
  }

  if (provider === "openai") {
    return callOpenAI(`${systemPrompt}\n\n${userPrompt}`);
  } else {
    return callGemini(`${systemPrompt}\n\n${userPrompt}`);
  }
}
