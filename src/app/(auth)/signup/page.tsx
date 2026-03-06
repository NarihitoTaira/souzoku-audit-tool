"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      setError(
        error.message === "User already registered"
          ? "このメールアドレスは既に登録されています"
          : error.message
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md animate-in">
        <div className="glass rounded-2xl p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold">登録が完了しました</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {email} 宛に確認メールを送信しました。
            <br />
            メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 px-6 py-2.5 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-smooth"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30 mb-4">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-bold gradient-text">新規アカウント登録</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI品質監査ツールのご利用を開始
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="glass rounded-2xl p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            お名前（税理士名）
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 太郎"
              required
              className="w-full h-11 rounded-lg bg-secondary/50 border border-border/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
        </div>

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
              placeholder="example@tax-office.jp"
              required
              className="w-full h-11 rounded-lg bg-secondary/50 border border-border/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            パスワード（6文字以上）
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

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            パスワード確認
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              登録中...
            </span>
          ) : (
            "アカウントを作成"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          アカウントを作成することで、
          <Link href="/terms" className="text-primary hover:underline">利用規約</Link>
          および
          <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>
          に同意したものとみなされます。
        </p>

        <p className="text-center text-xs text-muted-foreground">
          既にアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            ログイン
          </Link>
        </p>
      </form>
    </div>
  );
}
