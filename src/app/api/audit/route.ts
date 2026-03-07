import { NextRequest, NextResponse } from "next/server";
import { runDiagnosis } from "@/lib/ai-client";
import { DIAGNOSIS_PROMPT_TEMPLATE } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subsidyName, businessPlan, guidelinesSummary, companyInfo } = body;

    // 診断プロンプトの構築
    const prompt = DIAGNOSIS_PROMPT_TEMPLATE
      .replace("{subsidy_name}", subsidyName || "（未選択）")
      .replace("{guidelines_summary}", guidelinesSummary || "（公募要項未読込）")
      .replace("{business_plan}", businessPlan || "（事業計画書未読込）")
      .replace("{company_info}", companyInfo || "（企業情報未設定）");

    // AI診断実行
    const diagnosisResult = await runDiagnosis(prompt);

    return NextResponse.json({
      success: true,
      subsidyName,
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
