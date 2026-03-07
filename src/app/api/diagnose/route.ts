import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runDiagnosis } from "@/lib/ai-client";
import { DIAGNOSIS_PROMPT_TEMPLATE } from "@/lib/prompts";
import { resolveApiKeyAndCheckLimit, logDiagnosis } from "@/lib/api-key-resolver";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const body = await request.json();
    const { subsidyName, businessPlan, guidelinesSummary, companyInfo, documentId } = body;

    // 認証チェック
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: authHeader ? { Authorization: authHeader } : {} },
      });
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // 事業計画書テキストの取得（DBから or リクエストボディから）
    let planText = businessPlan || "";
    if (!planText && documentId && supabaseUrl && supabaseKey && userId) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: authHeader ? { Authorization: authHeader } : {} },
      });
      const { data: doc } = await supabase
        .from("uploaded_documents")
        .select("extracted_text")
        .eq("id", documentId)
        .eq("user_id", userId)
        .single();
      planText = doc?.extracted_text || "";
    }

    if (!planText) {
      return NextResponse.json(
        { error: "事業計画書のテキストが見つかりません。先にファイルをアップロードしてください。" },
        { status: 400 }
      );
    }

    // BYOK + 利用制限チェック
    let apiKey: string | undefined;
    let apiSource: "byok" | "platform" = "platform";

    if (userId && supabaseUrl && supabaseKey) {
      const limitResult = await resolveApiKeyAndCheckLimit(userId, supabaseUrl, supabaseKey);

      if (!limitResult.allowed) {
        // 制限ログ
        await logDiagnosis(supabaseUrl, supabaseKey, {
          userId,
          apiKeySource: limitResult.source,
          status: "rate_limited",
          errorMessage: limitResult.message,
          durationMs: Date.now() - startTime,
        });

        return NextResponse.json({
          error: limitResult.message,
          rateLimited: true,
          remaining: limitResult.remaining,
        }, { status: 429 });
      }

      apiKey = limitResult.apiKey;
      apiSource = limitResult.source;
    }

    // プロンプト構築
    const prompt = DIAGNOSIS_PROMPT_TEMPLATE
      .replace("{subsidy_name}", subsidyName || "（未選択）")
      .replace("{guidelines_summary}", guidelinesSummary || "（公募要項未読込）")
      .replace("{business_plan}", planText.substring(0, 30000)) // 最大3万文字
      .replace("{company_info}", companyInfo || "（企業情報未設定）");

    // AI診断実行
    const diagnosisResult = await runDiagnosis(prompt, apiKey);
    const durationMs = Date.now() - startTime;

    // 結果をDBに保存
    let diagnosisId: string | undefined;
    if (supabaseUrl && supabaseKey && userId) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: authHeader ? { Authorization: authHeader } : {} },
      });

      const { data: saved } = await supabase
        .from("subsidy_diagnoses")
        .insert({
          user_id: userId,
          subsidy_name: subsidyName || "未指定",
          business_plan_text: planText.substring(0, 50000),
          total_score: diagnosisResult.scores.total_score,
          adoption_rank: diagnosisResult.scores.adoption_probability,
          scores: diagnosisResult.scores,
          findings: diagnosisResult.findings,
          summary: diagnosisResult.summary,
          api_key_source: apiSource,
        })
        .select("id")
        .single();

      diagnosisId = saved?.id;

      // プラットフォームキー使用時はカウントをインクリメント
      if (apiSource === "platform") {
        const { incrementDiagnosisCount } = await import("@/lib/api-key-resolver");
        await incrementDiagnosisCount(userId, supabaseUrl, supabaseKey);
      }

      // 診断ログ記録
      await logDiagnosis(supabaseUrl, supabaseKey, {
        userId,
        diagnosisId,
        apiKeySource: apiSource,
        durationMs,
        status: "success",
      });
    }

    return NextResponse.json({
      success: true,
      diagnosisId,
      subsidyName,
      apiSource,
      result: diagnosisResult,
    });
  } catch (error) {
    console.error("Diagnosis error:", error);
    return NextResponse.json(
      { error: "診断処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
