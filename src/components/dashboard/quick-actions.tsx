"use client";

import Link from "next/link";
import { Upload, ClipboardCheck, BookOpen, FileSearch } from "lucide-react";

const actions = [
  {
    label: "事業計画書をアップロード",
    description: "PDF/Word/Excelを解析",
    icon: Upload,
    href: "/upload",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    label: "補助金診断を実行",
    description: "AIによる採択シミュレーション",
    icon: ClipboardCheck,
    href: "/audit",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    label: "補助金ナレッジを確認",
    description: "審査基準・申請のコツ",
    icon: BookOpen,
    href: "/knowledge",
    gradient: "from-emerald-500 to-green-400",
  },
  {
    label: "採択事例を検索",
    description: "過去の成功事例を参照",
    icon: FileSearch,
    href: "/search",
    gradient: "from-amber-500 to-orange-400",
  },
];

export function QuickActions() {
  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-base font-semibold">よく使う操作</h2>
      <p className="text-xs text-muted-foreground mt-0.5">ワンクリックで各機能へ</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-secondary/30 transition-smooth group"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} opacity-70 group-hover:opacity-100 transition-smooth`}
            >
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-medium">{action.label}</p>
              <p className="text-[9px] text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
