import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercelサーバーレスで Node.js ランタイムを強制
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * エラーをSupabaseに記録
 */
async function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("error_logs").insert({
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      metadata: meta || {},
    });
  } catch {
    // ログ保存自体が失敗しても無視
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let fileName = "unknown";
  let fileSize = 0;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "business_plan";

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    fileName = file.name;
    fileSize = file.size;

    // ファイルサイズ制限
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズが上限（5MB）を超えています（${(file.size / 1024 / 1024).toFixed(1)}MB）` },
        { status: 400 }
      );
    }

    // テキスト抽出
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    let parseMethod = "unknown";

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      parseMethod = "pdf-parse";
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer, {
          // テストファイル読込を防ぐため最小限のオプション
          max: 0, // ページ制限なし
        });
        extractedText = pdfData.text || "";
        parseMethod = "pdf-parse-ok";
      } catch (pdfError) {
        // pdf-parse失敗時のフォールバック: バイナリからテキスト部分を抽出
        await logError("pdf-parse-failed", pdfError, { fileName, fileSize });

        // 簡易テキスト抽出（PDFバイナリからプレーンテキスト部分を取得）
        try {
          const rawText = buffer.toString("utf-8");
          // PDF内のテキストストリームから可読文字列を抽出
          const textMatches = rawText.match(/[\u3000-\u9FFF\u0020-\u007E\uFF00-\uFFEF]+/g);
          if (textMatches) {
            extractedText = textMatches
              .filter(t => t.length > 5) // 短すぎるフラグメントを除外
              .join("\n");
          }
          parseMethod = "fallback-regex";
        } catch (fallbackError) {
          await logError("pdf-fallback-failed", fallbackError, { fileName });
          return NextResponse.json({
            error: `PDFの解析に失敗しました。詳細: ${pdfError instanceof Error ? pdfError.message : "不明なエラー"}`,
            debugInfo: {
              fileName,
              fileSize,
              fileType: file.type,
              parseMethod,
              errorType: pdfError instanceof Error ? pdfError.constructor.name : typeof pdfError,
              duration: Date.now() - startTime,
            }
          }, { status: 500 });
        }
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      parseMethod = "mammoth";
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      parseMethod = "csv-utf8";
      extractedText = buffer.toString("utf-8");
    } else {
      parseMethod = "raw-utf8";
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      await logError("empty-extraction", new Error("No text extracted"), {
        fileName, fileSize, parseMethod, fileType: file.type,
      });
      return NextResponse.json({
        error: "ファイルからテキストを抽出できませんでした。別のファイルをお試しください。",
        debugInfo: { fileName, fileSize, parseMethod, fileType: file.type },
      }, { status: 400 });
    }

    // Supabase にテキストを保存
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const authHeader = request.headers.get("authorization");
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: authHeader ? { Authorization: authHeader } : {} },
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error: insertError } = await supabase.from("uploaded_documents").insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type || "unknown",
          file_size: file.size,
          extracted_text: extractedText.substring(0, 100000),
          category,
        });

        if (insertError) {
          await logError("db-insert-failed", insertError, { fileName, userId: user.id });
        }
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      textLength: extractedText.length,
      textPreview: extractedText.substring(0, 500),
      parseMethod,
      category,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Upload error:", error);
    await logError("upload-catch-all", error, { fileName, fileSize });

    return NextResponse.json({
      error: `ファイルの処理中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      debugInfo: {
        fileName,
        fileSize,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      },
    }, { status: 500 });
  }
}
