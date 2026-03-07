"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Upload,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface DiagnosisData {
  id: string;
  subsidy_name: string;
  total_score: number;
  adoption_rank: string;
  scores: {
    innovation_score: number;
    feasibility_score: number;
    market_score: number;
    profitability_score: number;
    policy_alignment_score: number;
  };
  findings: Array<{
    category: string;
    severity: string;
    title: string;
    description: string;
    suggestion: string;
    expected_score_impact: string;
    reference: string;
  }>;
  summary: {
    overall_assessment: string;
  };
  api_key_source: string;
  created_at: string;
}

const rankColor = (rank: string) => {
  switch (rank) {
    case "A": return "text-emerald-500";
    case "B": return "text-blue-500";
    case "C": return "text-amber-500";
    case "D": return "text-red-500";
    default: return "text-muted-foreground";
  }
};

const severityColor = (s: string) => {
  switch (s) {
    case "high": return "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20";
    case "medium": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "low": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    default: return "bg-secondary/50 text-muted-foreground border-border/50";
  }
};

const severityLabel = (s: string) => {
  switch (s) {
    case "high": return "高リスク";
    case "medium": return "中リスク";
    case "low": return "低リスク";
    default: return s;
  }
};

const scoreAxes = [
  { key: "innovation_score", label: "革新性" },
  { key: "feasibility_score", label: "実現可能性" },
  { key: "market_score", label: "市場分析" },
  { key: "profitability_score", label: "収益計画" },
  { key: "policy_alignment_score", label: "政策適合性" },
];

function AuditContent() {
  const searchParams = useSearchParams();
  const diagnosisId = searchParams.get("id");
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchDiagnosis() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        let query = supabase
          .from("subsidy_diagnoses")
          .select("*")
          .eq("user_id", user.id);

        if (diagnosisId) {
          query = query.eq("id", diagnosisId);
        } else {
          query = query.order("created_at", { ascending: false }).limit(1);
        }

        const { data } = await query.single();
        setDiagnosis(data);
      } catch {
        // no data
      } finally {
        setLoading(false);
      }
    }
    fetchDiagnosis();
  }, [diagnosisId]);

  const toggleCard = (i: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-2">まだ診断結果がありません</h2>
        <p className="text-sm text-muted-foreground mb-6">
          事業計画書をアップロードして、採択可能性を診断しましょう
        </p>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-smooth"
        >
          <Upload className="h-4 w-4" />
          事業計画書をアップロード
        </Link>
      </div>
    );
  }

  const scores = diagnosis.scores || {};

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">採択シミュレーション結果</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {diagnosis.subsidy_name} · {new Date(diagnosis.created_at).toLocaleDateString("ja-JP")}
        </p>
      </div>

      {/* Score Banner */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground">総合スコア</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold">{diagnosis.total_score}</span>
              <span className="text-lg text-muted-foreground">/100</span>
              <span className={`text-2xl font-bold ml-2 ${rankColor(diagnosis.adoption_rank)}`}>
                {diagnosis.adoption_rank}ランク
              </span>
            </div>
          </div>
          <TrendingUp className={`h-10 w-10 ${rankColor(diagnosis.adoption_rank)}`} />
        </div>

        {/* 5 Axis Scores */}
        <div className="space-y-2">
          {scoreAxes.map((axis) => {
            const score = (scores as Record<string, number>)[axis.key] || 0;
            return (
              <div key={axis.key} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20">{axis.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-700"
                    style={{ width: `${(score / 20) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-10 text-right">{score}/20</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Assessment */}
      {diagnosis.summary?.overall_assessment && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            総合評価
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {diagnosis.summary.overall_assessment}
          </p>
        </div>
      )}

      {/* Findings */}
      {diagnosis.findings && diagnosis.findings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            指摘事項 ({diagnosis.findings.length}件)
          </h3>
          {diagnosis.findings.map((finding, i) => (
            <div key={i} className={`glass rounded-xl overflow-hidden border ${severityColor(finding.severity)}`}>
              <button
                onClick={() => toggleCard(i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/10 transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColor(finding.severity)}`}>
                    {severityLabel(finding.severity)}
                  </span>
                  <span className="text-sm font-medium">{finding.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium">{finding.expected_score_impact}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedCards.has(i) ? "rotate-180" : ""}`} />
                </div>
              </button>
              {expandedCards.has(i) && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3 animate-in">
                  <div>
                    <p className="text-xs font-semibold text-red-500 dark:text-red-400 mb-1">指摘内容</p>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 mb-1">💡 AI改善提案</p>
                    <p className="text-sm text-muted-foreground">{finding.suggestion}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">📋 {finding.reference}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <AuditContent />
    </Suspense>
  );
}
