"use client";

import { Search, FileSearch, ArrowRight } from "lucide-react";
import { useState } from "react";
import { RiskBadge } from "@/components/audit/risk-badge";

const mockSearchResults = [
  {
    id: "S-001",
    title: "渋谷区 神南エリアの土地評価事例",
    matchScore: 0.94,
    summary:
      "渋谷区神南の角地評価において、側方路線影響加算の適用を含む路線価評価の事例。3名の相続人による遺産分割を完了。",
    date: "2025-09-15",
    totalAssets: "¥210,000,000",
    risks: { high: 0, medium: 1, low: 2 },
  },
  {
    id: "S-002",
    title: "港区 赤坂の事業用宅地特例適用事例",
    matchScore: 0.87,
    summary:
      "事業用小規模宅地等の特例を適用し、400㎡の面積要件内で80%減額を実施した事例。事業承継の要件を充足。",
    date: "2025-07-22",
    totalAssets: "¥380,000,000",
    risks: { high: 1, medium: 0, low: 1 },
  },
  {
    id: "S-003",
    title: "世田谷区 住宅地の配偶者控除適用事例",
    matchScore: 0.82,
    summary:
      "配偶者税額軽減を最大限活用した申告事例。二次相続を考慮した最適な遺産分割案を策定。",
    date: "2025-11-08",
    totalAssets: "¥145,000,000",
    risks: { high: 0, medium: 0, low: 3 },
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">類似事例検索</h1>
        <p className="text-sm text-muted-foreground mt-1">
          過去の申告書データからAIが類似事例を検索します（ベクトル検索）
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
              placeholder="例: 渋谷区 角地 路線価 小規模宅地..."
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
          キーワード、地域名、財産種別、特例名などで過去の類似事例を検索できます
        </p>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {mockSearchResults.length}件の類似事例が見つかりました
          </p>
          {mockSearchResults.map((result) => (
            <div
              key={result.id}
              className="glass rounded-xl p-5 hover:bg-secondary/20 transition-smooth cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
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
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {result.date}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {result.totalAssets}
                    </span>
                    <div className="flex gap-1">
                      {result.risks.high > 0 && (
                        <RiskBadge level="high" count={result.risks.high} />
                      )}
                      {result.risks.medium > 0 && (
                        <RiskBadge level="medium" count={result.risks.medium} />
                      )}
                      {result.risks.low > 0 && (
                        <RiskBadge level="low" count={result.risks.low} />
                      )}
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
            キーワードを入力して類似事例を検索してください
          </p>
        </div>
      )}
    </div>
  );
}
