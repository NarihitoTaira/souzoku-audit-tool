"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileCheck,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";

interface Stats {
  diagnosisCount: number;
  findingsCount: number;
  avgScore: number;
  avgRate: string;
  loaded: boolean;
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    diagnosisCount: 0,
    findingsCount: 0,
    avgScore: 0,
    avgRate: "–",
    loaded: false,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setStats(s => ({ ...s, loaded: true })); return; }

        const { data: diagnoses } = await supabase
          .from("subsidy_diagnoses")
          .select("total_score, findings")
          .eq("user_id", user.id);

        if (!diagnoses || diagnoses.length === 0) {
          setStats(s => ({ ...s, loaded: true }));
          return;
        }

        const count = diagnoses.length;
        const totalFindings = diagnoses.reduce(
          (sum, d) => sum + (Array.isArray(d.findings) ? d.findings.length : 0), 0
        );
        const avgScore = Math.round(
          diagnoses.reduce((sum, d) => sum + (d.total_score || 0), 0) / count
        );
        const avgRate =
          avgScore >= 80 ? "A" : avgScore >= 65 ? "B" : avgScore >= 50 ? "C" : "D";

        setStats({
          diagnosisCount: count,
          findingsCount: totalFindings,
          avgScore,
          avgRate,
          loaded: true,
        });
      } catch {
        setStats(s => ({ ...s, loaded: true }));
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      label: "診断件数",
      value: stats.diagnosisCount.toString(),
      sub: "累計",
      icon: FileCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "改善指摘",
      value: stats.findingsCount.toString(),
      sub: "累計",
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "採択見込",
      value: stats.avgRate,
      sub: "平均ランク",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "平均スコア",
      value: stats.avgScore > 0 ? `${stats.avgScore}点` : "–",
      sub: "/100点",
      icon: BarChart3,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="glass rounded-xl p-5 glass-hover transition-smooth">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              {!stats.loaded ? (
                <Loader2 className="h-4 w-4 animate-spin mt-2 text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
