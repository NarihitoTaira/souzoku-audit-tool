import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ログイン | 相続税AI品質監査ツール",
  description: "相続税AI品質監査ツールにログインします",
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
