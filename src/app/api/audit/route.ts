import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/ai-client";
import { AUDIT_PROMPT_TEMPLATE } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, decedentInfo, heirsInfo, propertyInventory } = body;

    // 監査プロンプトの構築
    const prompt = AUDIT_PROMPT_TEMPLATE
      .replace("{decedent_info}", decedentInfo || "（データ未設定）")
      .replace("{heirs_info}", heirsInfo || "（データ未設定）")
      .replace("{property_inventory}", propertyInventory || "（データ未設定）")
      .replace("{valuation_details}", "（データ未設定）")
      .replace("{attached_documents}", "（データ未設定）")
      .replace("{applied_provisions}", "（データ未設定）");

    // AI監査実行
    const auditResult = await runAudit(prompt);

    return NextResponse.json({
      success: true,
      documentId,
      result: auditResult,
    });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: "監査処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
