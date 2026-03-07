"use client";

import { BookOpen, ChevronRight, ExternalLink, Search, Award } from "lucide-react";
import { useState } from "react";

interface SubsidyKnowledgeItem {
  id: string;
  subsidyName: string;
  category: string;
  title: string;
  description: string;
  checkpoints: string[];
  scoringCriteria: string;
  maxPoints: number;
  tips: string;
}

const knowledgeBase: SubsidyKnowledgeItem[] = [
  {
    id: "KB-001",
    subsidyName: "事業再構築補助金",
    category: "事業計画の妥当性",
    title: "補助事業の具体的取組内容",
    description:
      "SWOT分析に基づく現状分析と、事業再構築の必要性・具体的取組内容を明確に記載します。",
    checkpoints: [
      "SWOT分析が論理的に整理されているか",
      "事業再構築の必要性が市場データで裏付けられているか",
      "具体的な取組内容が5W1Hで明確か",
      "事業再構築の類型との整合性",
      "補助事業の実施スケジュールが具体的か",
    ],
    scoringCriteria: "市場ニーズを考慮し、補助事業の実施方法・スケジュールが妥当か",
    maxPoints: 20,
    tips: "SWOT分析は図表で視覚的に示し、箇条書きではなく文章で詳しく説明しましょう。",
  },
  {
    id: "KB-002",
    subsidyName: "事業再構築補助金",
    category: "市場の新規性",
    title: "ターゲット市場の分析",
    description:
      "新たに進出する市場のTAM/SAM/SOMを定量的に分析し、顧客ニーズの根拠を示します。",
    checkpoints: [
      "TAM/SAM/SOMが具体的に示されているか",
      "公的統計・調査レポートのエビデンス引用",
      "顧客ニーズの根拠（アンケート・ヒアリング）",
      "新規顧客獲得戦略が明確か",
    ],
    scoringCriteria: "自社の強みを踏まえた戦略的な組み合わせでリソース最適化が図られているか",
    maxPoints: 20,
    tips: "市場規模は必ず「出典」を明記。矢野経済研究所、富士経済、経産省統計等が有効。",
  },
  {
    id: "KB-003",
    subsidyName: "事業再構築補助金",
    category: "収益計画",
    title: "収益計画と自走計画",
    description:
      "補助事業終了後3〜5年の売上・利益計画と、補助金なしでの事業継続方法を示します。",
    checkpoints: [
      "3〜5年の年度別売上・利益計画があるか",
      "売上見込みの根拠が具体的か（単価×数量）",
      "付加価値額の年率3%以上の増加計画",
      "補助事業終了後の自走計画が明確か",
      "投資回収期間が妥当か",
    ],
    scoringCriteria: "事業化に至るまでの遂行方法及びスケジュールが妥当であるか",
    maxPoints: 20,
    tips: "付加価値額＝営業利益＋人件費＋減価償却費。年率3%以上の伸びを計算で示しましょう。",
  },
  {
    id: "KB-004",
    subsidyName: "ものづくり補助金",
    category: "技術面",
    title: "革新的な製品・サービスの開発",
    description:
      "開発する製品・サービスの技術的新規性と既存技術との差別化を示します。",
    checkpoints: [
      "開発内容の革新性が明確か",
      "既存技術との優位性の説明",
      "特許・知的財産権の取得見込み",
      "試作品の開発計画が具体的か",
    ],
    scoringCriteria: "革新的な製品・サービス開発が地域経済の発展に寄与するものであるか",
    maxPoints: 25,
    tips: "「従来技術との比較表」を入れると革新性が一目で伝わります。",
  },
  {
    id: "KB-005",
    subsidyName: "ものづくり補助金",
    category: "事業計画",
    title: "付加価値額・賃上げ要件",
    description:
      "付加価値額年平均3%以上、給与支給総額年平均1.5%以上の増加計画が必要です。",
    checkpoints: [
      "付加価値額が年平均3%以上増加する計画か",
      "給与支給総額が年平均1.5%以上増加する計画か",
      "事業場内最低賃金が地域別最低賃金＋30円以上か",
      "計画の達成根拠が数値で示されているか",
    ],
    scoringCriteria: "付加価値額、給与支給総額の増加目標が適切に設定されているか",
    maxPoints: 25,
    tips: "給与支給総額には法定福利費を含みません。計算間違いに注意。",
  },
  {
    id: "KB-006",
    subsidyName: "IT導入補助金",
    category: "業務プロセス",
    title: "IT導入による業務効率化",
    description:
      "導入するITツールによる業務プロセスの改善・効率化の具体的な計画を示します。",
    checkpoints: [
      "導入するITツールの選定理由が明確か",
      "現状の業務課題が具体的に整理されているか",
      "導入後の業務フロー改善イメージ",
      "生産性向上の数値目標（削減時間・コスト等）",
    ],
    scoringCriteria: "経営課題を理解し、ITツール導入目的が明確であるか",
    maxPoints: 30,
    tips: "「導入前後の業務フロー比較図」を作成すると効果を視覚的にアピールできます。",
  },
  {
    id: "KB-007",
    subsidyName: "小規模事業者持続化補助金",
    category: "経営計画",
    title: "経営計画書の充実度",
    description:
      "自社の経営状況と今後の方針を分かりやすく記載します。写真・図表の活用が有効です。",
    checkpoints: [
      "企業概要が分かりやすく記載されているか",
      "自社の強み・弱みが明確に分析されているか",
      "経営方針・今後のプランが具体的か",
      "市場動向・顧客ニーズの分析があるか",
    ],
    scoringCriteria: "自社の経営状況分析の妥当性。経営方針・目標の適切性",
    maxPoints: 30,
    tips: "写真・図表を多用して「読みやすさ」を重視。商工会議所の指導員に相談も有効。",
  },
  {
    id: "KB-008",
    subsidyName: "共通",
    category: "加点項目",
    title: "主要な加点項目チェックリスト",
    description:
      "補助金共通で活用できる加点項目を確認し、一つでも多く該当させることで採択率を上げます。",
    checkpoints: [
      "事業継続力強化計画（BCP）の策定・認定",
      "パートナーシップ構築宣言の登録",
      "経営革新計画の承認",
      "賃上げ計画の表明（給与引上げ率の明示）",
      "デジタル技術の活用",
      "グリーン分野への取組",
    ],
    scoringCriteria: "各補助金の加点項目への該当状況",
    maxPoints: 10,
    tips: "加点項目は申請前に準備が必要なものが多いです。早めに確認しましょう。",
  },
];

const subsidyNames = Array.from(new Set(knowledgeBase.map((k) => k.subsidyName)));

export default function KnowledgePage() {
  const [selectedSubsidy, setSelectedSubsidy] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = knowledgeBase.filter((item) => {
    const matchesSubsidy =
      !selectedSubsidy || item.subsidyName === selectedSubsidy;
    const matchesSearch =
      !searchQuery ||
      item.title.includes(searchQuery) ||
      item.description.includes(searchQuery) ||
      item.checkpoints.some((c) => c.includes(searchQuery));
    return matchesSubsidy && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">補助金ナレッジ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          主要補助金の審査基準・申請のコツ・加点テクニック集
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
            onClick={() => setSelectedSubsidy(null)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${
              !selectedSubsidy
                ? "gradient-primary text-white"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            すべて
          </button>
          {subsidyNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedSubsidy(name)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-smooth ${
                selectedSubsidy === name
                  ? "gradient-primary text-white"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {name}
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
                    {item.subsidyName} · {item.category} · 最大{item.maxPoints}点
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
                <div className="glass rounded-lg p-3">
                  <h4 className="text-xs font-medium text-amber-400 mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    審査基準
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.scoringCriteria}</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <h4 className="text-xs font-medium text-emerald-400 mb-1">
                    💡 採択のコツ
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.tips}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
