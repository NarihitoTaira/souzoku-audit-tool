import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（50MB上限）
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズが50MBを超えています" },
        { status: 400 }
      );
    }

    // ファイル種別チェック
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "対応していないファイル形式です（PDF, Excel, CSVのみ）" },
        { status: 400 }
      );
    }

    // TODO: 実際のファイル処理
    // 1. Supabase Storage にアップロード
    // 2. pdf-parse / xlsx でテキスト抽出
    // 3. チャンク分割 + ベクトル化
    // 4. document_chunks テーブルに保存

    // モックレスポンス
    return NextResponse.json({
      success: true,
      document: {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        status: "processing",
        chunkCount: 0,
        message: "ファイルを受け付けました。テキスト抽出を開始します。",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロード中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
