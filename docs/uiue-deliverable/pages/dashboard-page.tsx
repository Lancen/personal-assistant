"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Smile,
  BookOpen,
  Settings,
  Bell,
  User,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Lock,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// 模拟数据
const stats = [
  {
    id: 1,
    title: "今日任务完成",
    value: "8/12",
    change: "+12%",
    trend: "up",
    icon: CheckSquare,
  },
  {
    id: 2,
    title: "情绪记录天数",
    value: "28",
    change: "+3",
    trend: "up",
    icon: Smile,
  },
  {
    id: 3,
    title: "知识笔记",
    value: "46",
    change: "-2%",
    trend: "down",
    icon: BookOpen,
  },
  {
    id: 4,
    title: "专注时长",
    value: "3.2h",
    change: "+18%",
    trend: "up",
    icon: TrendingUp,
  },
];

const recentActivities = [
  {
    id: 1,
    type: "task",
    title: "完成项目设计文档",
    time: "10分钟前",
    status: "completed",
  },
  {
    id: 2,
    type: "mood",
    title: "记录今日情绪：平静",
    time: "2小时前",
    status: "completed",
  },
  {
    id: 3,
    type: "note",
    title: "添加新笔记：成长思考",
    time: "昨天",
    status: "completed",
  },
  {
    id: 4,
    type: "task",
    title: "准备周会分享材料",
    time: "明天",
    status: "pending",
  },
];

const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, active: true },
  { id: "tasks", label: "任务管理", icon: CheckSquare, active: false },
  { id: "mood", label: "情绪记录", icon: Smile, active: false },
  { id: "notes", label: "知识笔记", icon: BookOpen, active: false },
  { id: "calendar", label: "日历", icon: Calendar, active: false },
  { id: "settings", label: "设置", icon: Settings, active: false },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background flex">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:sticky lg:top-0 lg:transform-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:h-dvh lg:shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">UIUE</span>
          </div>
          {/* 移动端关闭按钮 */}
          <button
            className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="关闭侧边栏"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-soft ease-soft ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.active && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* 顶部导航栏 */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* 移动端菜单按钮 */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* 页面标题 */}
            <h1 className="text-xl font-semibold text-foreground">
              仪表盘
            </h1>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-2 ml-auto">
              {/* 通知按钮 */}
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors relative"
                aria-label="通知"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              </button>

              {/* 用户菜单 */}
              <div className="relative">
                <button
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label="用户菜单"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <User className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-20 w-64 soft-card bg-card p-3 shadow-soft-lg">
                      <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                          <User className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            用户名
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            premium 账户
                          </p>
                        </div>
                      </div>
                      <div className="my-1 border-t border-border" />
                      <button
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground"
                        aria-label="退出登录"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 仪表盘内容 */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* 欢迎语 */}
          <div className="soft-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              👋 欢迎回来
            </h2>
            <p className="text-muted-foreground">
              今天是美好的一天，继续专注你的成长吧。
            </p>
          </div>

          {/* KPI 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isUp = stat.trend === "up";
              return (
                <div key={stat.id} className="soft-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          isUp ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{stat.change} 较上周</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 图表区域 + 最近活动 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 情绪趋势图表占位 */}
            <div className="lg:col-span-2 soft-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                近七日情绪趋势
              </h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">图表区域 - 待接入可视化库</p>
              </div>
            </div>

            {/* 最近活动 */}
            <div className="soft-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                最近活动
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                        activity.status === "completed"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/activities"
                className="mt-4 block text-center text-sm text-accent hover:underline underline-offset-2 transition-colors"
              >
                查看全部活动
              </Link>
            </div>
          </div>

          {/* 今日任务表格 */}
          <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                今日任务
              </h3>
              <button className="btn-primary py-2 px-4">添加任务</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      任务名称
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      优先级
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      状态
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-sm text-foreground">
                      晨间情绪记录
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        低
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        已完成
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-sm text-accent hover:underline">
                        查看
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-sm text-foreground">
                      整理今日知识笔记
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        中
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
                        进行中
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-sm text-accent hover:underline">
                        查看
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-sm text-foreground">
                      准备周会分享
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        高
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        未开始
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-sm text-accent hover:underline">
                        查看
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-sm text-muted-foreground">
            UIUE · 个人智能助手 · 注重隐私的个人成长工具
          </p>
        </footer>
      </div>
    </div>
  );
}
