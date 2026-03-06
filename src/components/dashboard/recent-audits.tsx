"use client";

import { RiskBadge } from "@/components/audit/risk-badge";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const recentAudits = [
  {
    id: "AUD-001",
    decedent: "山田 太郎",
    date: "2026-03-05",
    status: "完了",
    risksHigh: 1,
    risksMedium: 2,
    risksLow: 3,
    totalAssets: "¥185,000,000",
  },
  {
    id: "AUD-002",
    decedent: "佐藤 花子",
    date: "2026-03-03",
    status: "監査中",
    risksHigh: 0,
    risksMedium: 1,
    risksLow: 2,
    totalAssets: "¥92,500,000",
  },
  {
    id: "AUD-003",
    decedent: "鈴木 一郎",
    date: "2026-02-28",
    status: "完了",
    risksHigh: 2,
    risksMedium: 3,
    risksLow: 1,
    totalAssets: "¥340,000,000",
  },
  {
    id: "AUD-004",
    decedent: "田中 美咲",
    date: "2026-02-25",
    status: "完了",
    risksHigh: 0,
    risksMedium: 0,
    risksLow: 1,
    totalAssets: "¥55,000,000",
  },
];

export function RecentAudits() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <div>
          <h2 className="text-base font-semibold">最新の監査結果</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            直近の申告書監査ステータス
          </p>
        </div>
        <Link
          href="/audit"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-smooth"
        >
          すべて表示
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/30">
        {recentAudits.map((audit) => (
          <div
            key={audit.id}
            className="flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-smooth cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 text-xs font-mono font-medium text-muted-foreground">
                {audit.id.split("-")[1]}
              </div>
              <div>
                <p className="text-sm font-medium">{audit.decedent}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    {audit.date}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    · {audit.totalAssets}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {audit.risksHigh > 0 && (
                <RiskBadge level="high" count={audit.risksHigh} />
              )}
              {audit.risksMedium > 0 && (
                <RiskBadge level="medium" count={audit.risksMedium} />
              )}
              {audit.risksLow > 0 && (
                <RiskBadge level="low" count={audit.risksLow} />
              )}
              <span
                className={`ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  audit.status === "完了"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {audit.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
