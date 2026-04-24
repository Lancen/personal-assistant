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
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// 日历事件类型
interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: "task" | "mood" | "note";
  moodLevel?: number;
}

// 初始模拟数据
const initialEvents: CalendarEvent[] = [
  { id: "1", date: "2026-04-24", title: "记录情绪", type: "mood", moodLevel: 3 },
  { id: "2", date: "2026-04-24", title: "完成PRD评审", type: "task" },
  { id: "3", date: "2026-04-23", title: "沉淀思考笔记", type: "note" },
  { id: "4", date: "2026-04-22", title: "和朋友见面", type: "mood", moodLevel: 4 },
];

const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, active: false },
  { id: "tasks", label: "任务管理", icon: CheckSquare, active: false },
  { id: "mood", label: "情绪记录", icon: Smile, active: false },
  { id: "notes", label: "知识笔记", icon: BookOpen, active: false },
  { id: "calendar", label: "日历", icon: Calendar, active: true },
  { id: "settings", label: "设置", icon: Settings, active: false },
];

// 获取当月天数
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// 获取当月第一天是星期几 (0-6, 0=周日)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// 获取月份名称
const getMonthName = (month: number) => {
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];
  return monthNames[month];
};

// 情绪颜色映射
const moodColorMap: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-purple-500",
  3: "bg-green-500",
  4: "bg-amber-500",
  5: "bg-orange-500",
};

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // 获取选中日期的事件
  const selectedEvents = selectedDate
    ? initialEvents.filter(e => e.date === selectedDate)
    : [];

  // 获取日期的事件
  const getEventsForDate = (date: string) => {
    return initialEvents.filter(e => e.date === date);
  };

  // 类型图标映射
  const typeIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckSquare className="w-3 h-3" />;
      case "mood": return <Smile className="w-3 h-3" />;
      case "note": return <BookOpen className="w-3 h-3" />;
      default: return null;
    }
  };

  const typeBg = (type: string) => {
    switch (type) {
      case "task": return "bg-primary/10 text-primary";
      case "mood": return "bg-accent/10 text-accent-foreground";
      case "note": return "bg-secondary/10 text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:sticky lg:top-0 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-primary-foreground" />
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
                  <Calendar className="w-4 h-4 ml-auto" />
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
              日历
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

        {/* 日历内容 */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 日历主体 */}
            <div className="lg:col-span-2 soft-card p-6">
              {/* 月份导航 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {getMonthName(currentMonth)} {currentYear}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={prevMonth}
                    aria-label="上个月"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={nextMonth}
                    aria-label="下个月"
                  >
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* 日历网格 */}
              <div className="grid grid-cols-7 gap-1">
                {/* 星期表头 */}
                {["日", "一", "二", "三", "四", "五", "六"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center py-2 text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}

                {/* 空白占位 */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* 日期单元格 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDate(currentYear, currentMonth, day);
                  const events = getEventsForDate(dateStr);
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === currentMonth &&
                    today.getFullYear() === currentYear;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      className={`
                        aspect-square p-1 rounded-lg border text-center transition-colors
                        ${isToday
                          ? "border-primary bg-primary/5"
                          : isSelected
                          ? "border-accent bg-accent/5"
                          : "border-transparent hover:border-border hover:bg-muted"
                        }
                      `}
                      onClick={() => setSelectedDate(dateStr)}
                      aria-label={`${dateStr}${events.length > 0 ? `, ${events.length} 个事件` : ""}`}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday || isSelected ? "text-foreground" : "text-muted-foreground"}
                      `}>
                        {day}
                      </div>
                      {events.length > 0 && (
                        <div className="flex justify-center gap-1">
                          {events.slice(0, 3).map((event) => (
                            event.moodLevel ? (
                              <div
                                key={event.id}
                                className={`w-2 h-2 rounded-full ${moodColorMap[event.moodLevel]}`}
                              />
                            ) : (
                              <div
                                key={event.id}
                                className={`w-2 h-2 rounded-full ${typeBg(event.type)}`}
                              />
                            )
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 选中日期详情 */}
            <div className="soft-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {selectedDate ? selectedDate : "选择日期查看详情"}
              </h3>

              {!selectedDate ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>在左侧日历选择日期查看日程</p>
                </div>
              ) : selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>今日暂无活动</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={
                        event.type === "task"
                          ? "/tasks"
                          : event.type === "mood"
                          ? "/mood"
                          : "/notes"
                      }
                      className={`block p-3 rounded-lg border ${typeBg(event.type)} transition-colors hover:shadow-soft-md`}
                    >
                      <div className="flex items-center gap-2">
                        {typeIcon(event.type)}
                        <span className="text-sm font-medium">{event.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* 统计信息 */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  本月统计
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总活动</span>
                    <span className="font-medium text-foreground">{initialEvents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">任务</span>
                    <span className="font-medium text-foreground">
                      {initialEvents.filter(e => e.type === "task").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">情绪记录</span>
                    <span className="font-medium text-foreground">
                      {initialEvents.filter(e => e.type === "mood").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">笔记</span>
                    <span className="font-medium text-foreground">
                      {initialEvents.filter(e => e.type === "note").length}
                    </span>
                  </div>
                </div>
              </div>
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
