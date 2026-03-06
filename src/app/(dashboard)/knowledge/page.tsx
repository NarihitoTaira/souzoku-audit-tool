"use client";

import { BookOpen, ChevronRight, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  description: string;
  checkpoints: string[];
  reference: string;
}

const knowledgeBase: KnowledgeItem[] = [
  {
    id: "KB-001",
    category: "土地評価",
    title: "路線価方式による土地評価",
    description:
      "市街地にある宅地の評価は路線価方式を使用します。路線価は1㎡あたりの単価で、毎年7月に国税庁が公表します。",
    checkpoints: [
      "正面路線価の確認（路線価図の確認）",
      "奥行価格補正率の適用",
      "側方路線影響加算率の適用（角地の場合）",
      "二方路線影響加算率の適用",
      "不整形地補正率の適用",
      "地積規模の大きな宅地の評価",
    ],
    reference: "財産評価基本通達第11条～第20条の2",
  },
  {
    id: "KB-002",
    category: "土地評価",
    title: "倍率方式による土地評価",
    description:
      "路線価が定められていない地域では、固定資産税評価額に一定の倍率を乗じて評価します。",
    checkpoints: [
      "固定資産税評価額の確認",
      "評価倍率表の確認（国税庁サイト）",
      "地目による倍率の違い（宅地・田・畑・山林など）",
    ],
    reference: "財産評価基本通達第21条～第21条の2",
  },
  {
    id: "KB-003",
    category: "建物評価",
    title: "建物の固定資産税評価額による評価",
    description:
      "建物は固定資産税評価額がそのまま相続税評価額となります。ただし、賃貸用の場合は借家権割合を控除します。",
    checkpoints: [
      "固定資産評価証明書の取得",
      "賃貸用建物の場合：借家権割合（30%）の控除",
      "建築中の建物の評価（費用現価の70%）",
    ],
    reference: "財産評価基本通達第89条～第93条",
  },
  {
    id: "KB-004",
    category: "有価証券",
    title: "上場株式の評価",
    description:
      "上場株式は以下の4つの価額のうち最も低い価額で評価します。",
    checkpoints: [
      "課税時期の最終価格",
      "課税時期の月の毎日の最終価格の月平均額",
      "課税時期の月の前月の毎日の最終価格の月平均額",
      "課税時期の月の前々月の毎日の最終価格の月平均額",
    ],
    reference: "財産評価基本通達第169条",
  },
  {
    id: "KB-005",
    category: "特例措置",
    title: "小規模宅地等の特例（居住用）",
    description:
      "被相続人の居住用宅地について、一定の要件を満たす場合に330㎡まで80%減額できる特例です。",
    checkpoints: [
      "対象宅地が被相続人の居住用であること",
      "取得者が配偶者、または同居親族であること",
      "面積上限 330㎡の確認",
      "申告期限までの継続居住・保有要件",
      "遺産分割協議書の添付",
    ],
    reference: "租税特別措置法第69条の4",
  },
  {
    id: "KB-006",
    category: "特例措置",
    title: "小規模宅地等の特例（事業用）",
    description:
      "被相続人の事業用宅地について、400㎡まで80%減額できる特例です。",
    checkpoints: [
      "対象宅地が被相続人の事業用であること",
      "事業継続要件の確認",
      "面積上限 400㎡の確認",
      "居住用と併用する場合の調整計算",
    ],
    reference: "租税特別措置法第69条の4第3項第1号",
  },
  {
    id: "KB-007",
    category: "特例措置",
    title: "配偶者税額軽減",
    description:
      "配偶者が取得した財産額が法定相続分以下、または1億6千万円以下の場合は相続税がかかりません。",
    checkpoints: [
      "法定相続分の計算",
      "配偶者の取得財産額の確認",
      "1億6千万円との比較",
      "申告期限までの遺産分割の完了",
    ],
    reference: "相続税法第19条の2",
  },
  {
    id: "KB-008",
    category: "添付書類",
    title: "必須添付書類チェックリスト",
    description:
      "相続税申告に必要な添付書類の一覧です。書類の漏れは申告の不備となります。",
    checkpoints: [
      "被相続人の出生から死亡までの戸籍謄本",
      "相続人全員の戸籍謄本",
      "相続人全員の印鑑証明書",
      "遺産分割協議書（法定相続分以外で分割する場合）",
      "遺言書（ある場合）",
      "固定資産評価証明書",
      "預貯金の残高証明書（死亡日現在）",
      "保険金支払通知書",
      "有価証券の評価明細書",
    ],
    reference: "相続税法施行規則第16条",
  },
  {
    id: "KB-009",
    category: "預貯金",
    title: "預貯金の評価",
    description:
      "預貯金は相続開始日時点の残高に既経過利息を加算して評価します。",
    checkpoints: [
      "相続開始日時点の残高証明書の取得",
      "既経過利息の計算（源泉所得税控除後）",
      "定期預金の中途解約利率ではなく約定利率で計算",
      "外貨預金のTTBレートによる換算",
    ],
    reference: "財産評価基本通達第203条",
  },
];

const categories = Array.from(new Set(knowledgeBase.map((k) => k.category)));

export default function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = knowledgeBase.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.includes(searchQuery) ||
      item.description.includes(searchQuery) ||
      item.checkpoints.some((c) => c.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">税務ナレッジ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          相続税の申告要領・財産評価基本通達に基づくチェックポイント集
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${
              !selectedCategory
                ? "gradient-primary text-white"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${
                selectedCategory === cat
                  ? "gradient-primary text-white"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Items */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass rounded-xl overflow-hidden transition-smooth"
          >
            <button
              onClick={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.category} · {item.reference}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedId === item.id ? "rotate-90" : ""
                }`}
              />
            </button>

            {expandedId === item.id && (
              <div className="border-t border-border/30 p-4 space-y-3 animate-in">
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div>
                  <h4 className="text-xs font-medium text-primary mb-2">
                    確認項目
                  </h4>
                  <ul className="space-y-1.5">
                    {item.checkpoints.map((checkpoint, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        {checkpoint}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  {item.reference}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
