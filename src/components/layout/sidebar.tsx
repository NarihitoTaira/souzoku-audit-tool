"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  ClipboardCheck,
  BookOpen,
  Settings,
  FileSearch,
  Award,
} from "lucide-react";

const navigation = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { name: "事業計画アップロード", href: "/upload", icon: Upload },
  { name: "補助金診断", href: "/audit", icon: ClipboardCheck },
  { name: "補助金ナレッジ", href: "/knowledge", icon: BookOpen },
  { name: "採択事例検索", href: "/search", icon: FileSearch },
  { name: "システム設定", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 glass sidebar-glow border-r border-border/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <Award className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold gradient-text">補助金診断AI</h1>
          <p className="text-[10px] text-muted-foreground">採択可能性診断ツール</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                isActive
                  ? "gradient-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <div className="glass rounded-lg p-3">
          <p className="text-xs font-medium text-foreground">初期リリース版</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            v1.0.0 · AI採択診断エンジン
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full w-3/4 rounded-full gradient-primary animate-pulse-glow" />
          </div>
        </div>
      </div>
    </aside>
  );
}
