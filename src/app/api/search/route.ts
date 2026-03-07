import { NextRequest, NextResponse } from "next/server";

// モック検索結果（採択事例）
const mockResults = [
  {
    id: "case-001",
    title: "製造業DX推進による生産管理システム刷新（事業再構築補助金）",
    content:
      "金属加工業の中小企業が、IoTセンサーとクラウド型生産管理システムを導入し、受注から出荷までのリードタイムを40%短縮。付加価値額は年率5.2%増加を達成。TAM/SAM/SOM分析と競合比較表が高評価。",
    similarity: 0.94,
    metadata: {
      date: "2025-09-15",
      subsidyName: "事業再構築補助金",
      adoptionScore: 82,
      subsidyAmount: "¥15,000,000",
    },
  },
  {
    id: "case-002",
    title: "地域特産品のEC販路開拓（小規模事業者持続化補助金）",
    content:
      "地方の食品製造業者がECサイト構築とSNSマーケティングにより、県外売上比率を15%から45%に拡大。顧客アンケートに基づくペルソナ設定と具体的な販促計画が採択の決め手。",
    similarity: 0.87,
    metadata: {
      date: "2025-07-22",
      subsidyName: "小規模事業者持続化補助金",
      adoptionScore: 78,
      subsidyAmount: "¥500,000",
    },
  },
  {
    id: "case-003",
    title: "AIを活用した品質検査自動化（ものづくり補助金）",
    content:
      "プラスチック成形メーカーがAI画像認識による外観検査システムを開発。不良品検出率が95%から99.8%に向上し、検査工程の人員を3名削減。特許出願も計画に含めた点が革新性で高評価。",
    similarity: 0.82,
    metadata: {
      date: "2025-11-08",
      subsidyName: "ものづくり補助金",
      adoptionScore: 85,
      subsidyAmount: "¥10,000,000",
    },
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
