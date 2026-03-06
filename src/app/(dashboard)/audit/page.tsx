"use client";

import { AuditResultCard, type AuditResult } from "@/components/audit/audit-result-card";
import { RiskBadge } from "@/components/audit/risk-badge";
import { useState } from "react";
import { Filter, ShieldCheck } from "lucide-react";

const mockAuditResults: AuditResult[] = [
  {
    id: "R-001",
    category: "valuation_error",
    level: "high",
    title: "土地評価額の路線価適用誤り",
    description:
      "対象地（渋谷区神南1丁目）の路線価について、正面路線価のみ適用されていますが、角地のため側方路線影響加算率の適用が必要です。現在の評価額 ¥85,000,000 は過少評価の可能性があります。",
    suggestion:
      "角地補正率（0.03）を側方路線価に乗じて加算してください。修正後の推定評価額は約 ¥87,550,000 となります。国税庁の路線価図で側方路線価を確認し、財産評価基本通達16条に基づき再計算を推奨します。",
    reference: "財産評価基本通達第16条（側方路線影響加算）",
  },
  {
    id: "R-002",
    category: "missing_document",
    level: "high",
    title: "遺産分割協議書の添付漏れ",
    description:
      "小規模宅地等の特例（措法69条の4）を適用していますが、法定相続分とは異なる分割を前提としているため、遺産分割協議書の添付が必須です。現在のアップロード書類に含まれていません。",
    suggestion:
      "遺産分割協議書（全相続人の署名・実印押印済み）を添付してください。印鑑証明書（発行後3ヶ月以内）も併せて必要です。",
    reference: "相続税法第27条、同施行規則第16条",
  },
  {
    id: "R-003",
    category: "special_provision_risk",
    level: "medium",
    title: "小規模宅地等特例の面積要件確認",
    description:
      "特定居住用宅地等として330㎡まで80%減額を適用していますが、対象地の面積が345㎡と記載されており、超過部分15㎡は通常評価が必要です。",
    suggestion:
      "330㎡を超過する15㎡については通常評価額を適用してください。減額後の評価額を再計算し、超過分は通常評価として ¥2,250,000 を加算してください。",
    reference: "租税特別措置法第69条の4、同施行令第40条の2",
  },
  {
    id: "R-004",
    category: "valuation_error",
    level: "medium",
    title: "上場株式の評価方法の確認",
    description:
      "上場株式（トヨタ自動車株式会社 1,000株）について、課税時期の最終価格のみで評価されています。最終価格、月平均、前月平均、前々月平均の4つのうち最も低い価額を採用する必要があります。",
    suggestion:
      "課税時期の月を含む3か月間の月平均値を確認し、最も低い価額で評価し直してください。",
    reference: "財産評価基本通達第169条（上場株式の評価）",
  },
  {
    id: "R-005",
    category: "missing_document",
    level: "low",
    title: "預貯金の残高証明書の日付確認",
    description:
      "みずほ銀行の残高証明書の発行日が相続開始日の翌月になっています。相続開始日時点の残高を証明する必要があります。",
    suggestion:
      "銀行に相続開始日（死亡日）時点の残高証明書を再発行依頼してください。経過利息の計算も確認してください。",
    reference: "財産評価基本通達第203条（預貯金の評価）",
  },
  {
    id: "R-006",
    category: "special_provision_risk",
    level: "low",
    title: "配偶者税額軽減の適用確認",
    description:
      "配偶者税額軽減を適用する場合、法定相続分または1億6千万円のいずれか大きい金額まで非課税となります。計算根拠が明記されていません。",
    suggestion:
      "配偶者の法定相続分と1億6千万円を比較し、適用額の計算過程を申告書の付表に明記してください。",
    reference: "相続税法第19条の2（配偶者に対する税額軽減）",
  },
];

export default function AuditPage() {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

  const filtered =
    filter === "all"
      ? mockAuditResults
      : mockAuditResults.filter((r) => r.level === filter);

  const counts = {
    high: mockAuditResults.filter((r) => r.level === "high").length,
    medium: mockAuditResults.filter((r) => r.level === "medium").length,
    low: mockAuditResults.filter((r) => r.level === "low").length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">AI監査結果</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AIが検知したリスクと修正案の一覧です
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {mockAuditResults.length}件検知
          </span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="glass rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{counts.high}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              重要度: 高
            </p>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{counts.medium}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              重要度: 中
            </p>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{counts.low}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              重要度: 低
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(["all", "high", "medium", "low"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-smooth ${
                  filter === level
                    ? "gradient-primary text-white"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {level === "all"
                  ? "すべて"
                  : level === "high"
                  ? "高"
                  : level === "medium"
                  ? "中"
                  : "低"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filtered.map((result) => (
          <AuditResultCard key={result.id} result={result} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            該当するリスクはありません
          </p>
        </div>
      )}
    </div>
  );
}
