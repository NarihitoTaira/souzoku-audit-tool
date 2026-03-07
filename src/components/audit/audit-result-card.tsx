"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export interface DiagnosisResult {
  id: string;
  category: "weak_point" | "missing_element" | "structure_issue";
  level: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestion: string;
  reference: string;
  expectedScoreImpact: string;
}

const categoryLabels = {
  weak_point: "革新性・差別化の課題",
  missing_element: "記載不足・抜け漏れ",
  structure_issue: "計画構成の問題",
};

const categoryIcons = {
  weak_point: AlertTriangle,
  missing_element: CheckCircle2,
  structure_issue: Lightbulb,
};

export function DiagnosisResultCard({ result }: { result: DiagnosisResult }) {
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
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
            result.level === "high"
              ? "bg-red-500/10 text-red-400 border border-red-500/30"
              : result.level === "medium"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              result.level === "high" ? "bg-red-500" :
              result.level === "medium" ? "bg-amber-500" : "bg-emerald-500"
            }`} />
            {result.level === "high" ? "高" : result.level === "medium" ? "中" : "低"}
          </span>
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
              不採択リスク・指摘内容
            </h4>
            <p className="text-sm">{result.description}</p>
          </div>
          <div className="glass rounded-lg p-3">
            <h4 className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              AI改善提案
            </h4>
            <p className="text-sm">{result.suggestion}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">
                参照基準
              </h4>
              <p className="text-xs text-muted-foreground">{result.reference}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">{result.expectedScoreImpact}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
