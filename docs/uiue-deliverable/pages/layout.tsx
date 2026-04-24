import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人智能助手",
  description: "注重隐私的个人成长工具 - 情绪管理、任务管理、知识沉淀",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
