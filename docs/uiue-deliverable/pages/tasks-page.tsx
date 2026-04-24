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
  Plus,
  Check,
  Circle,
  Trash2,
  Edit,
  FileText,
  LogOut,
  Search,
  BarChart3,
  List,
  Grid,
} from "lucide-react";
import Link from "next/link";

// 任务优先级象限定义
type Quadrant = "important-urgent" | "important-not-urgent" | "urgent-not-important" | "not-important-not-urgent";

interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: Quadrant;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  linkedMood?: string;
  linkedNote?: string;
}

// 初始模拟数据
const initialTasks: Task[] = [
  {
    id: "1",
    title: "完成个人智能助手PRD评审",
    description: "检查需求文档是否完整，确认技术方案",
    quadrant: "important-urgent",
    completed: false,
    createdAt: "2026-04-24",
  },
  {
    id: "2",
    title: "沉淀本周思考笔记",
    description: "整理本周学到的新知识，更新个人知识库",
    quadrant: "important-not-urgent",
    completed: false,
    createdAt: "2026-04-24",
  },
  {
    id: "3",
    title: "回复工作邮件",
    description: "答复合作方关于项目进度的询问",
    quadrant: "urgent-not-important",
    completed: true,
    createdAt: "2026-04-23",
    completedAt: "2026-04-23",
  },
  {
    id: "4",
    title: "浏览行业资讯",
    description: "放松一下，看看最近有什么新技术",
    quadrant: "not-important-not-urgent",
    completed: false,
    createdAt: "2026-04-24",
  },
  {
    id: "5",
    title: "阅读技术书籍",
    description: "阅读《设计模式》第三章",
    quadrant: "important-not-urgent",
    completed: true,
    createdAt: "2026-04-20",
    completedAt: "2026-04-22",
  },
  {
    id: "6",
    title: "整理项目文档",
    description: "更新项目README文档",
    quadrant: "not-important-not-urgent",
    completed: true,
    createdAt: "2026-04-18",
    completedAt: "2026-04-19",
  },
  {
    id: "7",
    title: "团队周会",
    description: "参加每周团队同步会议",
    quadrant: "important-urgent",
    completed: true,
    createdAt: "2026-04-21",
    completedAt: "2026-04-21",
  },
];

const quadrantConfig = {
  "important-urgent": {
    title: "重要紧急",
    color: "bg-red-100/40 border-red-200/60",
    headerColor: "text-red-800",
    description: "立即处理",
  },
  "important-not-urgent": {
    title: "重要不紧急",
    color: "bg-green-100/40 border-green-200/60",
    headerColor: "text-green-800",
    description: "计划进行",
  },
  "urgent-not-important": {
    title: "紧急不重要",
    color: "bg-amber-100/40 border-amber-200/60",
    headerColor: "text-amber-800",
    description: "可授权他人",
  },
  "not-important-not-urgent": {
    title: "不重要不紧急",
    color: "bg-blue-100/40 border-blue-200/60",
    headerColor: "text-blue-800",
    description: "有空再做",
  },
};

const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, active: false },
  { id: "tasks", label: "任务管理", icon: CheckSquare, active: true },
  { id: "mood", label: "情绪记录", icon: Smile, active: false },
  { id: "notes", label: "知识笔记", icon: BookOpen, active: false },
  { id: "calendar", label: "日历", icon: Calendar, active: false },
  { id: "settings", label: "设置", icon: Settings, active: false },
];

type Tab = "quadrant" | "all";

type TimeFilterOption = "all" | "today" | "week" | "month";

export default function TasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("quadrant");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuadrant, setFilterQuadrant] = useState<Quadrant | "all">("all");
  const [createdTimeFilter, setCreatedTimeFilter] = useState<TimeFilterOption>("all");
  const [completedTimeFilter, setCompletedTimeFilter] = useState<TimeFilterOption>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    quadrant: "important-urgent" as Quadrant,
  });

  const toggleTaskCompleted = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString().split('T')[0] : undefined,
          }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      quadrant: newTask.quadrant,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", quadrant: "important-urgent" });
    setShowAddModal(false);
  };

  // 按象限分组任务
  const groupedTasks = {
    "important-urgent": tasks.filter(t => t.quadrant === "important-urgent"),
    "important-not-urgent": tasks.filter(t => t.quadrant === "important-not-urgent"),
    "urgent-not-important": tasks.filter(t => t.quadrant === "urgent-not-important"),
    "not-important-not-urgent": tasks.filter(t => t.quadrant === "not-important-not-urgent"),
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  // 时间过滤判断
  const isInTimeRange = (dateStr: string | undefined, filter: TimeFilterOption): boolean => {
    if (filter === "all") return true;
    if (!dateStr) return false; // 如果没有日期且筛选不是all，不匹配

    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    switch (filter) {
      case "today":
        return diffDays === 0;
      case "week":
        return diffDays <= 7;
      case "month":
        return diffDays <= 30;
      default:
        return true;
    }
  };

  // 过滤所有任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuadrant = filterQuadrant === "all" || task.quadrant === filterQuadrant;
    const matchesCreatedTime = isInTimeRange(task.createdAt, createdTimeFilter);
    const matchesCompletedTime = isInTimeRange(task.completedAt, completedTimeFilter);
    return matchesSearch && matchesQuadrant && matchesCreatedTime && matchesCompletedTime;
  });

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
                  <CheckSquare className="w-4 h-4 ml-auto" />
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
              任务管理
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

        {/* 任务列表内容 */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* 统计头部 */}
          <div className="soft-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">今日任务</h2>
                <p className="text-muted-foreground">
                  {stats.completed} / {stats.total} 已完成 · {stats.pending} 待处理
                </p>
              </div>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4" />
                <span>新建任务</span>
              </button>
            </div>

            {/* 情绪提示 - 根据今日情绪建议调整优先级 */}
            <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-accent-foreground">
                💡 <strong>今日情绪提示</strong>: 你今日情绪状态良好，可以安排优先级较高的任务。
              </p>
            </div>
          </div>

          {/* 二级标签导航 */}
          <div className="soft-card p-2 inline-flex gap-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "quadrant"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveTab("quadrant")}
            >
              四象限
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveTab("all")}
            >
              所有任务
            </button>
          </div>

          {/* 根据标签显示不同内容 */}
          {activeTab === "quadrant" && (
            <>
            {/* 四象限网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(quadrantConfig) as Quadrant[]).map((quadrant) => {
                const config = quadrantConfig[quadrant];
                const quadrantTasks = groupedTasks[quadrant];

                return (
                  <div
                    key={quadrant}
                    className={`soft-card p-4 ${config.color}`}
                  >
                    <div className="mb-3">
                      <h3 className={`text-lg font-semibold ${config.headerColor}`}>
                        {config.title}
                        <span className="text-sm font-normal ml-2 opacity-70">
                          ({quadrantTasks.length})
                        </span>
                      </h3>
                      <p className={`text-xs ${config.headerColor} opacity-70`}>
                        {config.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {quadrantTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          暂无任务
                        </p>
                      ) : (
                        quadrantTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-md border ${
                              task.completed
                                ? "bg-white/50 border-border opacity-60"
                                : "bg-card border-border"
                            } transition-colors`}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                className="mt-0.5 shrink-0"
                                onClick={() => toggleTaskCompleted(task.id)}
                                aria-label={task.completed ? "标记未完成" : "标记已完成"}
                              >
                                {task.completed ? (
                                  <Check className="w-4 h-4 text-primary" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium text-foreground ${
                                    task.completed ? "line-through opacity-60" : ""
                                  }`}
                                >
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                                {(task.linkedMood || task.linkedNote) && (
                                  <div className="flex items-center gap-2 mt-2">
                                    {task.linkedMood && (
                                      <Link
                                        href={`/mood/${task.linkedMood}`}
                                        className="text-xs text-accent hover:underline flex items-center gap-1"
                                      >
                                        <Smile className="w-3 h-3" />
                                        <span>关联情绪</span>
                                      </Link>
                                    )}
                                    {task.linkedNote && (
                                      <Link
                                        href={`/notes/${task.linkedNote}`}
                                        className="text-xs text-accent hover:underline flex items-center gap-1"
                                      >
                                        <FileText className="w-3 h-3" />
                                        <span>关联笔记</span>
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                                  onClick={() => deleteTask(task.id)}
                                  aria-label="删除任务"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                                  aria-label="编辑任务"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}

          {/* 所有任务 - 列表视图 */}
          {activeTab === "all" && (
            <div className="soft-card p-6">
              {/* 搜索和筛选 */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索任务..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-10 w-full"
                  />
                </div>
                <select
                  value={filterQuadrant}
                  onChange={(e) => setFilterQuadrant(e.target.value as Quadrant | "all")}
                  className="form-input w-full lg:w-48"
                >
                  <option value="all">所有象限</option>
                  {(Object.keys(quadrantConfig) as Quadrant[]).map((q) => (
                    <option key={q} value={q}>{quadrantConfig[q].title}</option>
                  ))}
                </select>
                <select
                  value={createdTimeFilter}
                  onChange={(e) => setCreatedTimeFilter(e.target.value as TimeFilterOption)}
                  className="form-input w-full lg:w-36"
                >
                  <option value="all">创建: 全部</option>
                  <option value="today">创建: 今天</option>
                  <option value="week">创建: 近7天</option>
                  <option value="month">创建: 近30天</option>
                </select>
                <select
                  value={completedTimeFilter}
                  onChange={(e) => setCompletedTimeFilter(e.target.value as TimeFilterOption)}
                  className="form-input w-full lg:w-36"
                >
                  <option value="all">完成: 全部</option>
                  <option value="today">完成: 今天</option>
                  <option value="week">完成: 近7天</option>
                  <option value="month">完成: 近30天</option>
                </select>
              </div>

              {/* 任务列表 */}
              <div className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>没有找到匹配的任务</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id} className="py-3">
                      <div className="flex items-start gap-3">
                        <button
                          className="mt-0.5 shrink-0"
                          onClick={() => toggleTaskCompleted(task.id)}
                          aria-label={task.completed ? "标记未完成" : "标记已完成"}
                        >
                          {task.completed ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-base font-medium text-foreground ${
                              task.completed ? "line-through opacity-60" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          {/* 时间信息 */}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              创建: {task.createdAt}
                            </span>
                            {task.completed && task.completedAt && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                完成: {task.completedAt}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${quadrantConfig[task.quadrant].color} ${quadrantConfig[task.quadrant].headerColor}`}>
                              {quadrantConfig[task.quadrant].title}
                            </span>
                            {(task.linkedMood || task.linkedNote) && (
                              <>
                                {task.linkedMood && (
                                  <Link
                                    href={`/mood/${task.linkedMood}`}
                                    className="text-xs text-accent hover:underline flex items-center gap-1"
                                  >
                                    <Smile className="w-3 h-3" />
                                    <span>关联情绪</span>
                                  </Link>
                                )}
                                {task.linkedNote && (
                                  <Link
                                    href={`/notes/${task.linkedNote}`}
                                    className="text-xs text-accent hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>关联笔记</span>
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                            onClick={() => deleteTask(task.id)}
                            aria-label="删除任务"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                            aria-label="编辑任务"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>

        {/* 新建任务模态框 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-soft-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">新建任务</h3>
                <button
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setShowAddModal(false)}
                  aria-label="关闭"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleAddTask}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="task-title" className="form-label">
                      任务标题
                    </label>
                    <input
                      id="task-title"
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      className="form-input w-full"
                      placeholder="输入任务名称"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="task-description" className="form-label">
                      任务描述 (可选)
                    </label>
                    <textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      className="form-input w-full min-h-[80px]"
                      placeholder="描述任务细节"
                    />
                  </div>
                  <div>
                    <label className="form-label">优先级象限</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(quadrantConfig) as Quadrant[]).map((q) => {
                        const cfg = quadrantConfig[q];
                        return (
                          <label
                            key={q}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                              newTask.quadrant === q
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            <input
                              type="radio"
                              name="quadrant"
                              value={q}
                              checked={newTask.quadrant === q}
                              onChange={() =>
                                setNewTask({ ...newTask, quadrant: q })
                              }
                              className="w-4 h-4 text-primary"
                            />
                            <div>
                              <div className={`font-medium ${cfg.headerColor}`}>
                                {cfg.title}
                              </div>
                              <div className={`text-xs ${cfg.headerColor} opacity-70`}>
                                {cfg.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2 mt-6">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={!newTask.title.trim()}
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
