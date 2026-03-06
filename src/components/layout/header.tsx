"use client";

import { Bell, Search, Menu, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 px-6 glass">
      {/* Mobile menu button */}
      <button className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-smooth">
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="申告書・事例を検索..."
            className="w-full h-9 rounded-lg bg-secondary/50 border border-border/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-smooth">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-risk-high animate-pulse" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-xs font-bold text-white">税</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">税理士</p>
            <p className="text-[10px] text-muted-foreground">ログイン中</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-smooth"
          title="ログアウト"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
