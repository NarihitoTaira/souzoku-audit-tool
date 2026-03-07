/**
 * APIキー解決 & 利用制限ロジック（BYOK対応）
 *
 * 優先順位: ユーザーAPIキー（BYOK） → プラットフォームキー
 * BYOKの場合は回数制限バイパス
 */

import { createClient } from "@supabase/supabase-js";

interface RateLimitResult {
  allowed: boolean;
  apiKey: string;
  source: "byok" | "platform";
  remaining: number | null; // BYOKの場合はnull（無制限）
  message?: string;
}

/**
 * APIキーの解決と利用制限チェック
 */
export async function resolveApiKeyAndCheckLimit(
  userId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ユーザープロファイル取得
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("user_api_key, monthly_diagnosis_count, max_monthly_diagnoses, monthly_reset_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    // プロファイルが存在しない場合は作成を試みる
    await supabase.from("user_profiles").upsert({ id: userId });
    return checkPlatformKey(0, 3);
  }

  // 月次リセットのチェック
  if (profile.monthly_reset_at && new Date(profile.monthly_reset_at) <= new Date()) {
    await supabase
      .from("user_profiles")
      .update({
        monthly_diagnosis_count: 0,
        monthly_reset_at: getNextMonthStart(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    profile.monthly_diagnosis_count = 0;
  }

  // BYOK: ユーザーが自分のAPIキーを持っている場合
  if (profile.user_api_key && profile.user_api_key.trim() !== "") {
    return {
      allowed: true,
      apiKey: profile.user_api_key,
      source: "byok",
      remaining: null, // 無制限
    };
  }

  // プラットフォームキー使用
  return checkPlatformKey(
    profile.monthly_diagnosis_count || 0,
    profile.max_monthly_diagnoses || 3
  );
}

function checkPlatformKey(count: number, max: number): RateLimitResult {
  const platformKey = process.env.GOOGLE_AI_API_KEY;

  if (!platformKey) {
    return {
      allowed: false,
      apiKey: "",
      source: "platform",
      remaining: 0,
      message: "プラットフォームのAPIキーが設定されていません。設定画面から自分のAPIキーを登録してください。",
    };
  }

  if (count >= max) {
    return {
      allowed: false,
      apiKey: "",
      source: "platform",
      remaining: 0,
      message: `今月の診断回数上限（${max}回）に達しました。設定画面から自分のAPIキーを登録すると無制限で利用できます。`,
    };
  }

  return {
    allowed: true,
    apiKey: platformKey,
    source: "platform",
    remaining: max - count - 1,
  };
}

/**
 * 診断カウントをインクリメント（プラットフォームキー使用時のみ）
 */
export async function incrementDiagnosisCount(
  userId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  await supabase.rpc("increment_diagnosis_count", { target_user_id: userId });
}

/**
 * 診断ログを記録
 */
export async function logDiagnosis(
  supabaseUrl: string,
  supabaseServiceKey: string,
  params: {
    userId: string;
    diagnosisId?: string;
    apiKeySource: "byok" | "platform";
    modelUsed?: string;
    durationMs?: number;
    status: "success" | "error" | "rate_limited";
    errorMessage?: string;
  }
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  await supabase.from("diagnosis_logs").insert({
    user_id: params.userId,
    diagnosis_id: params.diagnosisId,
    api_key_source: params.apiKeySource,
    model_used: params.modelUsed || "gemini-1.5-flash",
    duration_ms: params.durationMs,
    status: params.status,
    error_message: params.errorMessage,
  });
}

function getNextMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}
