"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが正しくありません"
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md animate-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30 mb-4">
          <Award className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-bold gradient-text">補助金採択可能性診断ツール</h1>
        <p className="text-sm text-muted-foreground mt-1">アカウントにログイン</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="glass rounded-2xl p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            メールアドレス
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.co.jp"
              required
              className="w-full h-11 rounded-lg bg-secondary/50 border border-border/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            パスワード
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full h-11 rounded-lg bg-secondary/50 border border-border/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-smooth shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              ログイン中...
            </span>
          ) : (
            "ログイン"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            新規登録
          </Link>
        </p>
      </form>

      {/* Legal Links */}
      <div className="flex justify-center gap-4 mt-4">
        <Link href="/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-smooth">
          利用規約
        </Link>
        <span className="text-[11px] text-muted-foreground">·</span>
        <Link href="/privacy" className="text-[11px] text-muted-foreground hover:text-foreground transition-smooth">
          プライバシーポリシー
        </Link>
      </div>
    </div>
  );
}
