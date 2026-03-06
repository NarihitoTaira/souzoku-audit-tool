"use client";

import { RiskBadge } from "@/components/audit/risk-badge";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";

export interface AuditResult {
  id: string;
  category: "valuation_error" | "missing_document" | "special_provision_risk";
  level: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestion: string;
  reference: string;
}

const categoryLabels = {
  valuation_error: "評価額計算ミス",
  missing_document: "添付書類の漏れ",
  special_provision_risk: "特例適用リスク",
};

const categoryIcons = {
  valuation_error: AlertTriangle,
  missing_document: CheckCircle2,
  special_provision_risk: Lightbulb,
};

export function AuditResultCard({ result }: { result: AuditResult }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = categoryIcons[result.category];

  return (
    <div
      className={`glass rounded-xl overflow-hidden transition-smooth border ${
        result.level === "high"
          ? "border-red-500/20"
          : result.level === "medium"
          ? "border-amber-500/20"
          : "border-emerald-500/20"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-smooth"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              result.level === "high"
                ? "bg-red-500/10"
                : result.level === "medium"
                ? "bg-amber-500/10"
                : "bg-emerald-500/10"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                result.level === "high"
                  ? "text-red-400"
                  : result.level === "medium"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">{result.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {categoryLabels[result.category]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={result.level} />
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border/30 p-4 space-y-3 animate-in">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              検知内容
            </h4>
            <p className="text-sm">{result.description}</p>
          </div>
          <div className="glass rounded-lg p-3">
            <h4 className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              AI修正案
            </h4>
            <p className="text-sm">{result.suggestion}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              参照根拠
            </h4>
            <p className="text-xs text-muted-foreground">{result.reference}</p>
          </div>
        </div>
      )}
    </div>
  );
}
