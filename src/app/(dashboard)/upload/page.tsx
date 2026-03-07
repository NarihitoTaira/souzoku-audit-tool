"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Shield,
  Sparkles,
  Search,
  BarChart3,
  ArrowRight,
} from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: "pending" | "uploading" | "complete" | "error";
  textPreview?: string;
  textLength?: number;
  documentId?: string;
  errorMessage?: string;
  category: "business_plan" | "guidelines";
}

const DIAGNOSIS_STEPS = [
  { icon: Search, label: "公募要項をスキャン中...", duration: 2000 },
  { icon: FileText, label: "事業計画書を精査中...", duration: 3000 },
  { icon: BarChart3, label: "加点ポイントを算出中...", duration: 2000 },
  { icon: Sparkles, label: "改善提案を生成中...", duration: 2000 },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSubsidy, setSelectedSubsidy] = useState("事業再構築補助金");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File, category: "business_plan" | "guidelines") => {
    const newFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      category,
    };
    setFiles((prev) => [...prev, newFile]);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
        body: formData,
      });

      const data = await res.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? {
                ...f,
                status: res.ok ? "complete" : "error",
                textPreview: data.textPreview,
                textLength: data.textLength,
                errorMessage: data.error,
              }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: "error", errorMessage: "アップロードに失敗しました" }
            : f
        )
      );
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((f) => uploadFile(f, "business_plan"));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: "business_plan" | "guidelines") => {
    const selected = Array.from(e.target.files || []);
    selected.forEach((f) => uploadFile(f, category));
    e.target.value = "";
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const completedFiles = files.filter((f) => f.status === "complete");
  const businessPlan = completedFiles.find((f) => f.category === "business_plan");

  const startDiagnosis = async () => {
    if (!businessPlan || !agreed) return;
    setDiagnosing(true);
    setCurrentStep(0);
    setError("");

    // ステップ表示
    for (let i = 0; i < DIAGNOSIS_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, DIAGNOSIS_STEPS[i].duration));
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          subsidyName: selectedSubsidy,
          businessPlan: businessPlan.textPreview, // will use DB document if available
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "診断に失敗しました");
        setDiagnosing(false);
        return;
      }

      router.push(`/audit${data.diagnosisId ? `?id=${data.diagnosisId}` : ""}`);
    } catch {
      setError("診断中にエラーが発生しました。再度お試しください。");
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold gradient-text">事業計画書アップロード</h1>
        <p className="text-sm text-muted-foreground mt-1">
          事業計画書と公募要項をアップロードして採択可能性を診断します
        </p>
      </div>

      {/* 補助金選択 */}
      <div className="glass rounded-xl p-5 space-y-3">
        <label className="text-sm font-semibold">対象補助金を選択</label>
        <select
          value={selectedSubsidy}
          onChange={(e) => setSelectedSubsidy(e.target.value)}
          className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
        >
          <option>事業再構築補助金</option>
          <option>ものづくり補助金</option>
          <option>IT導入補助金</option>
          <option>小規模事業者持続化補助金</option>
          <option>その他</option>
        </select>
      </div>

      {/* ドラッグ＆ドロップエリア */}
      <div
        className={`glass rounded-xl p-8 border-2 border-dashed transition-smooth text-center ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">
          事業計画書をドラッグ＆ドロップ
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          PDF / Word (.docx) / CSV 対応（最大5MB）
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary/80 text-sm cursor-pointer transition-smooth">
          <FileText className="h-4 w-4" />
          ファイルを選択
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.csv,.xlsx"
            onChange={(e) => handleFileSelect(e, "business_plan")}
          />
        </label>
      </div>

      {/* アップロード済みファイル */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="glass rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {file.status === "uploading" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : file.status === "complete" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : file.status === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size / 1024).toFixed(0)}KB
                    {file.textLength && ` · ${file.textLength.toLocaleString()}文字抽出`}
                    {file.errorMessage && (
                      <span className="text-red-400 dark:text-red-400"> · {file.errorMessage}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.name)}
                className="p-1 rounded hover:bg-secondary/50 transition-smooth"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 免責同意 + 診断開始 */}
      {businessPlan && (
        <div className="glass rounded-xl p-5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary mt-0.5"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="h-3.5 w-3.5 inline mr-1 text-amber-500" />
              <a href="/terms" target="_blank" className="text-primary hover:underline">利用規約</a>
              および免責事項に同意します。AI診断は参考情報であり、採択を保証するものではありません。
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {diagnosing ? (
            <div className="space-y-3 py-2">
              {DIAGNOSIS_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  {i < currentStep ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : i === currentStep ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border/50" />
                  )}
                  <span className={`text-sm ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={startDiagnosis}
              disabled={!agreed}
              className="w-full py-3 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-smooth shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              採択可能性診断を開始する
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
