import { Lock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="responsive-container whitespace-2xl">
        {/* Hero 区域 - 大量留白符合极简主义 */}
        <section className="whitespace-2xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            个人智能助手
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            注重隐私的个人成长工具 · 情绪管理 · 任务管理 · 知识沉淀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary">开始登录</Link>
            <button className="btn-secondary">了解更多</button>
          </div>
        </section>

        {/* 功能卡片区域 - 响应式网格 */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">核心功能</h2>
          <div className="responsive-grid">
            <div className="soft-card p-6">
              <div className="mb-4">
                <div className="encrypted-indicator">
                  <Lock className="w-3 h-3" />
                  <span>端到端加密</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">情绪记录</h3>
              <p className="text-muted-foreground">
                安全记录每日情绪变化，数据只保存在你的设备。
              </p>
            </div>

            <div className="soft-card p-6">
              <div className="mb-4">
                <div className="encrypted-indicator">
                  <Lock className="w-3 h-3" />
                  <span>端到端加密</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">任务管理</h3>
              <p className="text-muted-foreground">
                极简任务追踪，聚焦当下，减少焦虑。
              </p>
            </div>

            <div className="soft-card p-6">
              <div className="mb-4">
                <div className="encrypted-indicator">
                  <Lock className="w-3 h-3" />
                  <span>端到端加密</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">知识沉淀</h3>
              <p className="text-muted-foreground">
                慢慢积累你的思考，隐私得到完全保护。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
