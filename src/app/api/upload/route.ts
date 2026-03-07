import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "business_plan";

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    // ファイルサイズ制限
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズが上限（${MAX_FILE_SIZE / 1024 / 1024}MB）を超えています` },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".docx") && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "対応ファイル形式: PDF, Word(.docx), Excel, CSV" },
        { status: 400 }
      );
    }

    // テキスト抽出
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (file.type === "text/csv") {
      extractedText = buffer.toString("utf-8");
    } else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "ファイルからテキストを抽出できませんでした。別のファイルをお試しください。" },
        { status: 400 }
      );
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
        await supabase.from("uploaded_documents").insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "unknown"),
          file_size: file.size,
          extracted_text: extractedText.substring(0, 100000), // 最大10万文字
          category,
        });
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      textLength: extractedText.length,
      textPreview: extractedText.substring(0, 500),
      category,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "ファイルの処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
