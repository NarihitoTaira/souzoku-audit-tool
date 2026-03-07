"use client";

import { Search, FileSearch, ArrowRight, Award } from "lucide-react";
import { useState } from "react";

const mockSearchResults = [
  {
    id: "S-001",
    title: "製造業DX推進 — 生産管理システム刷新（事業再構築補助金）",
    matchScore: 0.94,
    summary:
      "金属加工業がIoTセンサーとクラウド型生産管理システムを導入し、リードタイムを40%短縮。TAM/SAM/SOM分析と競合比較表が高評価。付加価値額は年率5.2%増加を達成。",
    date: "2025-09-15",
    subsidyName: "事業再構築補助金",
    adoptionScore: 82,
    rank: "A",
    subsidyAmount: "¥15,000,000",
  },
  {
    id: "S-002",
    title: "地域特産品のEC販路開拓（小規模事業者持続化補助金）",
    matchScore: 0.87,
    summary:
      "地方の食品製造業者がECサイト構築とSNSマーケティングにより県外売上比率を15%→45%に拡大。顧客アンケートに基づくペルソナ設定が採択の決め手。",
    date: "2025-07-22",
    subsidyName: "小規模事業者持続化補助金",
    adoptionScore: 78,
    rank: "B",
    subsidyAmount: "¥500,000",
  },
  {
    id: "S-003",
    title: "AIを活用した品質検査自動化（ものづくり補助金）",
    matchScore: 0.82,
    summary:
      "プラスチック成形メーカーがAI画像認識による外観検査システムを開発。不良品検出率95%→99.8%に向上、検査工程の人員3名削減。特許出願計画が革新性で高評価。",
    date: "2025-11-08",
    subsidyName: "ものづくり補助金",
    adoptionScore: 85,
    rank: "A",
    subsidyAmount: "¥10,000,000",
  },
];

const rankColor = (rank: string) => {
  switch (rank) {
    case "A":
      return "bg-emerald-500/10 text-emerald-400";
    case "B":
      return "bg-blue-500/10 text-blue-400";
    case "C":
      return "bg-amber-500/10 text-amber-400";
    default:
      return "bg-secondary/50 text-muted-foreground";
  }
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">採択事例検索</h1>
        <p className="text-sm text-muted-foreground mt-1">
          過去の採択事例からAIが類似ケースを検索し、成功パターンを参照できます
        </p>
      </div>

      {/* Search Box */}
      <div className="glass rounded-xl p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="例: 製造業 DX 生産性向上 IT導入..."
              className="w-full h-12 rounded-lg bg-secondary/50 border border-border/50 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-smooth shadow-lg shadow-primary/25"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          業種、補助金名、技術キーワードなどで過去の採択成功事例を検索できます
        </p>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {mockSearchResults.length}件の採択事例が見つかりました
          </p>
          {mockSearchResults.map((result) => (
            <div
              key={result.id}
              className="glass rounded-xl p-5 hover:bg-secondary/20 transition-smooth cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-smooth">
                      {result.title}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {Math.round(result.matchScore * 100)}%一致
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.summary}
                  </p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">
                      {result.date}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {result.subsidyName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      補助金額: {result.subsidyAmount}
                    </span>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-bold text-foreground">
                        {result.adoptionScore}点
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rankColor(result.rank)}`}>
                        {result.rank}ランク
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasSearched && (
        <div className="glass rounded-xl p-12 text-center">
          <FileSearch className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground mt-4">
            キーワードを入力して採択事例を検索してください
          </p>
        </div>
      )}
    </div>
  );
}
