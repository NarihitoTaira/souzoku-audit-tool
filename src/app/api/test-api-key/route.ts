import { NextRequest, NextResponse } from "next/server";
import { testApiKey } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { valid: false, error: "APIキーを入力してください" },
        { status: 400 }
      );
    }

    const result = await testApiKey(apiKey.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error("API key test error:", error);
    return NextResponse.json(
      { valid: false, error: "テスト中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
