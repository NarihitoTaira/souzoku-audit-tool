import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { category, message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "メッセージを入力してください" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Supabase未設定時はモック成功レスポンス
      console.log("[Mock] Inquiry received:", { category, message });
      return NextResponse.json({
        success: true,
        id: `mock-${Date.now()}`,
        message: "お問い合わせを受け付けました（モック）",
      });
    }

    // Authorization ヘッダーからユーザートークンを取得
    const authHeader = request.headers.get("authorization");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // ユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.from("inquiries").insert({
      user_id: user?.id,
      email: user?.email,
      category: category || "general",
      message: message.trim(),
      status: "new",
    }).select("id").single();

    if (error) {
      console.error("Inquiry insert error:", error);
      return NextResponse.json(
        { error: "送信に失敗しました。しばらく経ってから再度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "お問い合わせを受け付けました",
    });
  } catch (error) {
    console.error("Inquiry error:", error);
    return NextResponse.json(
      { error: "送信中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
