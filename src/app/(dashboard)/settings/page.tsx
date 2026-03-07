"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Brain,
  Database,
  Shield,
  Save,
  Check,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MessageSquare,
  Send,
  Key,
  Loader2,
  AlertCircle,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [showManual, setShowManual] = useState(false);
  // BYOK
  const [userApiKey, setUserApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [savingKey, setSavingKey] = useState(false);
  const [keySource, setKeySource] = useState<string>("未確認");
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  // Contact
  const [contactSent, setContactSent] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactCategory, setContactCategory] = useState("general");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

  // ユーザープロファイル読込
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_api_key, monthly_diagnosis_count, max_monthly_diagnoses")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.user_api_key) {
            setUserApiKey(profile.user_api_key);
            setKeySource("BYOK（自分のキー）");
          } else {
            setKeySource("プラットフォーム共有キー");
          }
          const remaining = (profile.max_monthly_diagnoses || 3) - (profile.monthly_diagnosis_count || 0);
          setRemainingCount(Math.max(0, remaining));
        }
      } catch {
        // DB未設定時はスキップ
      }
    }
    loadProfile();
  }, []);

  const handleTestApiKey = async () => {
    if (!userApiKey.trim()) return;
    setTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: userApiKey.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ valid: false, error: "接続テストに失敗しました" });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          user_api_key: userApiKey.trim() || null,
          updated_at: new Date().toISOString(),
        });

      setKeySource(userApiKey.trim() ? "BYOK（自分のキー）" : "プラットフォーム共有キー");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently fail
    } finally {
      setSavingKey(false);
    }
  };

  const handleContactSubmit = async () => {
    if (!contactMessage.trim()) return;
    setContactLoading(true);
    setContactError("");
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ category: contactCategory, message: contactMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setContactError(data.error || "送信に失敗しました"); return; }
      setContactSent(true);
      setContactMessage("");
      setTimeout(() => setContactSent(false), 3000);
    } catch {
      setContactError("通信エラーが発生しました");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">システム設定</h1>
        <p className="text-sm text-muted-foreground mt-1">
          APIキー・利用状況・セキュリティの管理
        </p>
      </div>

      {/* BYOK API Key Section */}
      <div className="glass rounded-xl p-5 space-y-4 border border-primary/20">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">APIキー設定（BYOK）</h2>
        </div>

        {/* 利用状況 */}
        <div className="glass rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">現在のキーソース</p>
            <p className="text-sm font-medium">{keySource}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">今月の残り回数</p>
            <p className="text-sm font-bold">
              {userApiKey.trim() ? (
                <span className="text-emerald-500">無制限</span>
              ) : (
                <span>{remainingCount !== null ? `${remainingCount}回` : "–"}</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5 inline mr-1 text-primary" />
          自分のAPIキーを登録すると、月間の診断回数制限が解除されます。
          キーは
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5 mx-0.5">
            Google AI Studio <ExternalLink className="h-2.5 w-2.5" />
          </a>
          で無料取得できます。
        </div>

        {/* キー入力 */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            Google AI APIキー
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showApiKey ? "text" : "password"}
                value={userApiKey}
                onChange={(e) => { setUserApiKey(e.target.value); setTestResult(null); }}
                placeholder="AIza..."
                className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 pl-3 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <button
              onClick={handleTestApiKey}
              disabled={!userApiKey.trim() || testingKey}
              className="px-4 h-10 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-smooth disabled:opacity-50 whitespace-nowrap"
            >
              {testingKey ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "接続テスト"
              )}
            </button>
          </div>
        </div>

        {/* テスト結果 */}
        {testResult && (
          <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
            testResult.valid
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
          }`}>
            {testResult.valid ? (
              <><CheckCircle2 className="h-4 w-4" /> APIキーは有効です。Gemini APIに正常接続できました。</>
            ) : (
              <><AlertCircle className="h-4 w-4" /> {testResult.error}</>
            )}
          </div>
        )}

        {/* 保存ボタン */}
        <button
          onClick={handleSaveApiKey}
          disabled={savingKey}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-smooth ${
            saved
              ? "bg-emerald-500 text-white"
              : "gradient-primary text-white hover:opacity-90 shadow-lg shadow-primary/25"
          }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" /> 保存しました
            </span>
          ) : savingKey ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 保存中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> APIキーを保存
            </span>
          )}
        </button>
      </div>

      {/* Setup Guide (collapsed) */}
      <div className="glass rounded-xl overflow-hidden">
        <button
          onClick={() => setShowManual(!showManual)}
          className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-smooth"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">📘 APIキー取得ガイド</h2>
          </div>
          {showManual ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showManual && (
          <div className="border-t border-border/30 p-5 space-y-3 animate-in">
            <ol className="space-y-2.5 text-sm">
              <li className="flex gap-2">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
                <span>
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Google AI Studio <ExternalLink className="h-3 w-3" />
                  </a> にGoogleアカウントでログイン
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">2</span>
                <span>「Create API key」をクリックしてキーを生成</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">3</span>
                <span>生成されたキー（AIza...）を上の入力欄に貼り付け</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">4</span>
                <span>「接続テスト」で確認後、「APIキーを保存」をクリック</span>
              </li>
            </ol>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-600 dark:text-emerald-400">
              💡 Gemini 1.5 Flashは無料枠（毎分15リクエスト）で利用でき、補助金診断には十分なクォータがあります。
            </div>
          </div>
        )}
      </div>

      {/* Supabase Info */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold">データベース</h2>
        </div>
        <div className="grid gap-3 text-xs">
          <div className="flex items-center justify-between glass rounded-lg px-3 py-2.5">
            <span className="text-muted-foreground">プロバイダー</span>
            <span className="font-medium">Supabase (PostgreSQL)</span>
          </div>
          <div className="flex items-center justify-between glass rounded-lg px-3 py-2.5">
            <span className="text-muted-foreground">リージョン</span>
            <span className="font-medium">東京 (ap-northeast-1)</span>
          </div>
          <div className="flex items-center justify-between glass rounded-lg px-3 py-2.5">
            <span className="text-muted-foreground">アクセス制御</span>
            <span className="font-medium">Row Level Security (RLS)</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold">セキュリティ・プライバシー</h2>
        </div>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 glass rounded-lg px-3 py-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border accent-primary" />
            企業機密情報のマスキング表示
          </label>
          <label className="flex items-center gap-2 glass rounded-lg px-3 py-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border accent-primary" />
            診断ログを30日間保持
          </label>
          <label className="flex items-center gap-2 glass rounded-lg px-3 py-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border accent-primary" />
            日本国内リージョンのみでデータ処理
          </label>
        </div>
      </div>

      {/* Contact */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">お問い合わせ・サポート</h2>
        </div>
        <div className="space-y-3">
          <select
            value={contactCategory}
            onChange={(e) => setContactCategory(e.target.value)}
            className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
          >
            <option value="general">一般的なお問い合わせ</option>
            <option value="bug">不具合の報告</option>
            <option value="feature">機能リクエスト</option>
            <option value="data">個人情報に関する請求（開示・訂正・削除）</option>
            <option value="billing">料金・プランについて</option>
          </select>
          <textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="お問い合わせ内容をご記入ください..."
            rows={4}
            className="w-full rounded-lg bg-secondary/50 border border-border/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth resize-none"
          />
          {contactError && (
            <div className="text-xs text-red-500 dark:text-red-400">{contactError}</div>
          )}
          <button
            onClick={handleContactSubmit}
            disabled={!contactMessage.trim() || contactLoading}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-smooth ${
              contactSent ? "bg-emerald-500 text-white" : "bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50"
            }`}
          >
            {contactSent ? (
              <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-4 w-4" /> 送信しました</span>
            ) : contactLoading ? (
              <span className="flex items-center justify-center gap-2">送信中...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Send className="h-4 w-4" /> お問い合わせを送信</span>
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          ※ 個人情報の開示・訂正・削除の請求もこちらから承ります。通常2営業日以内にご連絡いたします。
        </p>
      </div>
    </div>
  );
}
