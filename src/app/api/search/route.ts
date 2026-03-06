import { NextRequest, NextResponse } from "next/server";

// モック検索結果
const mockResults = [
  {
    id: "case-001",
    title: "渋谷区 神南エリアの土地評価事例",
    content:
      "渋谷区神南1丁目の角地における路線価方式での土地評価。正面路線価580千円/㎡、側方路線価420千円/㎡。側方路線影響加算率0.03を適用。奥行補正率0.99。地積180㎡。",
    similarity: 0.94,
    metadata: { date: "2025-09-15", totalAssets: 210000000 },
  },
  {
    id: "case-002",
    title: "港区 赤坂の事業用宅地特例事例",
    content:
      "港区赤坂の事業用宅地における小規模宅地等特例の適用事例。400㎡以内で80%減額。事業承継要件を充足し、適用が認められた事例。",
    similarity: 0.87,
    metadata: { date: "2025-07-22", totalAssets: 380000000 },
  },
  {
    id: "case-003",
    title: "世田谷区 住宅地の配偶者控除適用",
    content:
      "世田谷区の住宅地における配偶者税額軽減の適用事例。法定相続分1/2（7,250万円）と1億6千万円の比較。二次相続を考慮した遺産分割の最適化。",
    similarity: 0.82,
    metadata: { date: "2025-11-08", totalAssets: 145000000 },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "検索キーワードを入力してください" },
        { status: 400 }
      );
    }

    // TODO: Supabase pgvector による実際のベクトル検索
    // 1. クエリをベクトル化
    // 2. match_document_chunks() 関数で類似検索
    // 3. 結果を返却

    // モック: キーワードマッチでフィルタリング
    const results = mockResults.filter(
      (r) =>
        r.title.includes(query) ||
        r.content.includes(query) ||
        query.length > 0
    );

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
