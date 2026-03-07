import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ログイン | 補助金採択可能性診断ツール",
  description: "補助金採択可能性診断ツールにログインします",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
