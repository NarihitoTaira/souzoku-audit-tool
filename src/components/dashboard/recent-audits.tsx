"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, ArrowRight, FileText, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

interface DiagnosisRecord {
  id: string;
  subsidy_name: string;
  total_score: number;
  adoption_rank: string;
  created_at: string;
}

const rankColor = (rank: string) => {
  switch (rank) {
    case "A": return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400";
    case "B": return "bg-blue-500/10 text-blue-500 dark:text-blue-400";
    case "C": return "bg-amber-500/10 text-amber-500 dark:text-amber-400";
    case "D": return "bg-red-500/10 text-red-500 dark:text-red-400";
    default: return "bg-secondary/50 text-muted-foreground";
  }
};

export function RecentDiagnoses() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiagnoses() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
          .from("subsidy_diagnoses")
          .select("id, subsidy_name, total_score, adoption_rank, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setDiagnoses(data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDiagnoses();
  }, []);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <div>
          <h2 className="text-base font-semibold">最近の診断結果</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            直近の採択可能性診断ステータス
          </p>
        </div>
        {diagnoses.length > 0 && (
          <Link
            href="/audit"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-smooth"
          >
            すべて表示
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : diagnoses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-sm font-semibold mb-1">まだ診断結果がありません</h3>
          <p className="text-xs text-muted-foreground mb-4">
            事業計画書をアップロードして、採択可能性を診断しましょう
          </p>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-xs font-medium hover:opacity-90 transition-smooth"
          >
            <Upload className="h-3.5 w-3.5" />
            事業計画書をアップロード
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {diagnoses.map((diag) => (
            <Link
              key={diag.id}
              href={`/audit?id=${diag.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-smooth"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{diag.subsidy_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(diag.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {diag.total_score}
                  <span className="text-[10px] text-muted-foreground font-normal">/100</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rankColor(diag.adoption_rank)}`}>
                  {diag.adoption_rank}ランク
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
