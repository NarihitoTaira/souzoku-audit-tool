"use client";

import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "総申告件数",
    value: "24",
    change: "+3 今月",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    label: "検知リスク",
    value: "7",
    change: "要対応",
    icon: ShieldAlert,
    gradient: "from-red-500 to-orange-400",
  },
  {
    label: "修正完了",
    value: "18",
    change: "95%の精度",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-400",
  },
  {
    label: "品質スコア",
    value: "92",
    suffix: "/100",
    change: "+5 先月比",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-400",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="glass rounded-xl p-5 transition-smooth glass-hover group"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-sm text-muted-foreground">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.change}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg opacity-80 group-hover:opacity-100 transition-smooth`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
