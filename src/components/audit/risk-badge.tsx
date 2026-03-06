"use client";

interface RiskBadgeProps {
  level: "high" | "medium" | "low";
  count?: number;
  label?: string;
}

const config = {
  high: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
    label: "高",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    label: "中",
  },
  low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    label: "低",
  },
};

export function RiskBadge({ level, count, label }: RiskBadgeProps) {
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {label || c.label}
      {count !== undefined && count > 0 && (
        <span className="font-bold">{count}</span>
      )}
    </span>
  );
}
