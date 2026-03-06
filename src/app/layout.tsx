import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "相続税AI品質監査ツール",
  description:
    "相続税申告に特化したAI品質監査・ナレッジツール。過去の申告書と税法マスタを照合し、ミスやリスクを自動検知します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
