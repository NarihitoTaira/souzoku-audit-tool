"use client";

import { useState } from "react";
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
  Copy,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [showManual, setShowManual] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyEnvTemplate = () => {
    const template = `# Google Gemini API（無料枠あり）
GOOGLE_AI_API_KEY=ここにAPIキーを貼り付け
AI_PROVIDER=gemini`;
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">システム設定</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI接続・データベース・セキュリティの管理
        </p>
      </div>

      {/* API Key Setup Manual */}
      <div className="glass rounded-xl overflow-hidden border border-primary/20">
        <button
          onClick={() => setShowManual(!showManual)}
          className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-smooth"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">
              📘 AIセットアップガイド（はじめにお読みください）
            </h2>
          </div>
          {showManual ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showManual && (
          <div className="border-t border-border/30 p-5 space-y-4 animate-in">
            <div className="glass rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary mb-3">
                🔑 Google Gemini APIキーの取得方法（無料）
              </h3>
              <ol className="space-y-2.5 text-sm">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    1
                  </span>
                  <span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Google AI Studio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    にアクセスします
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    2
                  </span>
                  <span>Googleアカウントでログインします</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    3
                  </span>
                  <span>
                    「<strong>APIキーを作成</strong>」ボタンをクリックします
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    4
                  </span>
                  <span>
                    生成されたAPIキー（<code className="text-xs bg-secondary/70 px-1 rounded">AIza...</code> で始まる文字列）をコピーします
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    5
                  </span>
                  <span>
                    プロジェクトルートの <code className="text-xs bg-secondary/70 px-1 rounded">.env.local</code> ファイルにキーを設定してください
                  </span>
                </li>
              </ol>
            </div>

            {/* env.local template */}
            <div className="glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  .env.local の設定内容
                </h4>
                <button
                  onClick={copyEnvTemplate}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-smooth"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      コピー
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs bg-background/50 rounded p-3 overflow-x-auto text-emerald-400">
{`# Google Gemini API（無料枠あり）
GOOGLE_AI_API_KEY=ここにAPIキーを貼り付け
AI_PROVIDER=gemini`}
              </pre>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <p>
                Gemini 1.5 Flash は無料枠（1日あたり1500リクエスト）があり、
                初期利用には十分です。APIキーを設定しない場合はモックデータで動作します。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Provider */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">AIモデル設定</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              使用するAIモデル
            </label>
            <select
              defaultValue="gemini-flash"
              className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            >
              <option value="gemini-flash">
                Google Gemini 1.5 Flash（推奨・無料枠あり）
              </option>
              <option value="gemini-pro">
                Google Gemini 1.5 Pro（高精度・無料枠あり）
              </option>
              <option value="openai-gpt4o">
                OpenAI GPT-4o（有料）
              </option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Gemini APIキー
            </label>
            <input
              type="password"
              placeholder="AIza..."
              className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              ※ サーバー側の .env.local で管理することを推奨します
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              OpenAI APIキー（任意）
            </label>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
        </div>
      </div>

      {/* Supabase */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold">データベース接続</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Supabase プロジェクトURL
            </label>
            <input
              type="text"
              placeholder="https://xxxx.supabase.co"
              className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              匿名キー（Anon Key）
            </label>
            <input
              type="password"
              placeholder="eyJ..."
              className="w-full h-10 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          ※ 未設定の場合、ローカルのモックデータで動作します
        </p>
      </div>

      {/* Security */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold">セキュリティ・プライバシー</h2>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-primary"
            />
            アップロードデータの自動暗号化
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-primary"
            />
            個人情報（氏名・住所等）のマスキング処理
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-primary"
            />
            操作・監査ログの自動保持
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-primary"
            />
            日本国内リージョンのみでデータ処理
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-lg text-sm font-medium transition-smooth shadow-lg ${
          saved
            ? "bg-emerald-500 text-white shadow-emerald-500/25"
            : "gradient-primary text-white shadow-primary/25 hover:opacity-90"
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4" /> 保存しました
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Save className="h-4 w-4" /> 設定を保存する
          </span>
        )}
      </button>
    </div>
  );
}
