"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface RiskCategory {
  label: string;
  count: number;
  color: string;
}

export function RiskOverview() {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFindings() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: diagnoses } = await supabase
          .from("subsidy_diagnoses")
          .select("findings")
          .eq("user_id", user.id);

        if (!diagnoses || diagnoses.length === 0) {
          setCategories([
            { label: "革新性・差別化の不足", count: 0, color: "bg-red-500" },
            { label: "市場分析の根拠不足", count: 0, color: "bg-amber-500" },
            { label: "実現可能性の課題", count: 0, color: "bg-orange-500" },
            { label: "収益計画の不備", count: 0, color: "bg-yellow-500" },
            { label: "政策適合性の記載不足", count: 0, color: "bg-blue-500" },
          ]);
          setLoading(false);
          return;
        }

        // 全findingsからreference別に集計
        const refCounts: Record<string, number> = {};
        let totalCount = 0;
        for (const d of diagnoses) {
          if (Array.isArray(d.findings)) {
            for (const f of d.findings) {
              const ref = f.reference || "その他";
              refCounts[ref] = (refCounts[ref] || 0) + 1;
              totalCount++;
            }
          }
        }

        const defaultCategories = [
          { label: "革新性・差別化の不足", key: "審査項目1", color: "bg-red-500" },
          { label: "実現可能性の課題", key: "審査項目2", color: "bg-orange-500" },
          { label: "市場分析の根拠不足", key: "審査項目3", color: "bg-amber-500" },
          { label: "収益計画の不備", key: "審査項目4", color: "bg-yellow-500" },
          { label: "政策適合性の記載不足", key: "審査項目5", color: "bg-blue-500" },
        ];

        setCategories(
          defaultCategories.map((c) => ({
            ...c,
            count: Object.entries(refCounts)
              .filter(([k]) => k.includes(c.key))
              .reduce((sum, [, v]) => sum + v, 0),
          }))
        );
        setTotal(totalCount);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchFindings();
  }, []);

  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-base font-semibold mb-1">指摘分布</h2>
      <p className="text-xs text-muted-foreground mb-4">
        審査項目別の指摘件数
      </p>
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{cat.label}</span>
                <span className="font-medium">{cat.count}件</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                  style={{ width: total > 0 ? `${(cat.count / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
