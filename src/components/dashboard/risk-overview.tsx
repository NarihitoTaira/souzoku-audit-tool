"use client";

const riskData = [
  { label: "評価額計算ミス", count: 3, level: "high" as const },
  { label: "添付書類の漏れ", count: 2, level: "medium" as const },
  { label: "特例適用リスク", count: 1, level: "high" as const },
  { label: "期限超過の懸念", count: 1, level: "medium" as const },
  { label: "軽微な記載事項", count: 4, level: "low" as const },
];

const levelConfig = {
  high: { bar: "bg-red-500", text: "text-red-400" },
  medium: { bar: "bg-amber-500", text: "text-amber-400" },
  low: { bar: "bg-emerald-500", text: "text-emerald-400" },
};

export function RiskOverview() {
  const maxCount = Math.max(...riskData.map((d) => d.count));

  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-base font-semibold">リスク分布</h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        カテゴリ別のリスク検知数
      </p>
      <div className="mt-4 space-y-3">
        {riskData.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
              <span
                className={`text-xs font-bold ${levelConfig[item.level].text}`}
              >
                {item.count}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${levelConfig[item.level].bar} transition-all duration-700`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
