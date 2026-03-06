"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: "pending" | "processing" | "complete" | "error";
  progress: number;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const simulateUpload = (file: File) => {
    const newFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      status: "processing",
      progress: 0,
    };
    setFiles((prev) => [...prev, newFile]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, progress: 100, status: "complete" }
              : f
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, progress } : f
          )
        );
      }
    }, 500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(simulateUpload);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(simulateUpload);
    }
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return FileText;
    if (type.includes("sheet") || type.includes("excel"))
      return FileSpreadsheet;
    return FileText;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">
          書類アップロード
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          PDF・Excelファイルをアップロードして、AIによる品質監査を開始します
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative glass rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
          isDragging
            ? "border-2 border-primary/60 bg-primary/5 shadow-lg shadow-primary/10"
            : "border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-secondary/20"
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
              isDragging
                ? "gradient-primary shadow-lg shadow-primary/30 scale-110"
                : "bg-secondary/50 group-hover:bg-secondary"
            }`}
          >
            <Upload
              className={`h-7 w-7 ${
                isDragging ? "text-white" : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <p className="text-base font-medium">
              {isDragging
                ? "ここにドロップ"
                : "ファイルをドラッグ＆ドロップ"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              または
              <span className="text-primary font-medium cursor-pointer hover:underline">
                {" "}
                ファイルを選択{" "}
              </span>
              してください
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              対応形式: PDF, Excel (.xlsx, .xls), CSV · 最大50MB
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-sm font-semibold">
              アップロードファイル ({files.length})
            </h2>
          </div>
          <div className="divide-y divide-border/30">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.name}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/10 transition-smooth"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                    {file.status === "processing" && (
                      <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-primary transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "processing" && (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    )}
                    {file.status === "complete" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    <button
                      onClick={() => removeFile(file.name)}
                      className="p-1 rounded hover:bg-secondary/50 transition-smooth"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {files.some((f) => f.status === "complete") && (
            <div className="p-4 border-t border-border/50">
              <button className="w-full py-2.5 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-smooth shadow-lg shadow-primary/25">
                監査を開始する
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
