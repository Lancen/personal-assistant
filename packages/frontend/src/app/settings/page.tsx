"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar,
  Settings,
  Bell,
  User,
  Menu,
  X,
  Download,
  Trash2,
  Moon,
  Sun,
  Info,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// 设置分组
interface SettingSection {
  id: string;
  title: string;
  description: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "button";
  value?: boolean;
}

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, active: false },
  { id: 'tasks', label: '任务管理', icon: CheckSquare, active: false },
  { id: 'notes', label: '知识笔记', icon: BookOpen, active: false },
  { id: 'calendar', label: '日历', icon: Calendar, active: false },
  { id: 'settings', label: '设置', icon: Settings, active: true },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const sections: SettingSection[] = [
    {
      id: "appearance",
      title: "外观",
      description: "自定义应用外观和主题",
      items: [
        {
          id: "darkMode",
          label: "深色模式",
          description: "切换深色主题保护眼睛",
          type: "toggle",
          value: settings.darkMode,
        },
      ],
    },
    {
      id: "notifications",
      title: "通知",
      description: "管理通知推送设置",
      items: [
        {
          id: "notifications",
          label: "每日提醒",
          description: "每天提醒你记录任务和笔记",
          type: "toggle",
          value: settings.notifications,
        },
      ],
    },
    {
      id: "data",
      title: "数据",
      description: "管理你的个人数据",
      items: [
        {
          id: "autoSave",
          label: "自动保存",
          description: "自动保存更改到本地",
          type: "toggle",
          value: settings.autoSave,
        },
        {
          id: "export",
          label: "导出所有数据",
          description: "导出所有数据为 JSON 文件",
          type: "button",
        },
        {
          id: "clear",
          label: "清除所有数据",
          description: "清除本地存储的所有数据",
          type: "button",
        },
      ],
    },
    {
      id: "security",
      title: "安全与隐私",
      description: "安全和隐私相关设置",
      items: [
        {
          id: "privacy",
          label: "隐私说明",
          description: "所有数据仅存储在你的设备上",
          type: "button",
        },
      ],
    },
    {
      id: "about",
      title: "关于",
      description: "应用信息",
      items: [
        {
          id: "version",
          label: "版本",
          description: "v1.0.0",
          type: "button",
        },
      ],
    },
  ];

  const handleExport = () => {
    // 导出所有数据
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      message: "UIUE 数据导出",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uiue-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm("确定要清除所有数据吗？此操作不可撤销。")) {
      alert("数据已清除（演示模式）");
    }
  };

  const handleAction = (itemId: string) => {
    switch (itemId) {
      case "export":
        handleExport();
        break;
      case "clear":
        handleClear();
        break;
      case "privacy":
        alert("UIUE 注重隐私，所有数据仅保存在你的本地设备，不会上传到任何服务器。");
        break;
      case "version":
        alert("UIUE 个人智能助手 v1.0.0");
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:static lg:sticky lg:top-0 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:h-dvh lg:shrink-0`}
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
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.active && (
                  <Settings className="w-4 h-4 ml-auto" />
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
              className="lg:!hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* 页面标题 */}
            <h1 className="text-xl font-semibold text-foreground">
              设置
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
                            {user?.name || '用户'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email || ''}
                          </p>
                        </div>
                      </div>
                      <div className="my-1 border-t border-border" />
                      <button
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground"
                        aria-label="退出登录"
                        onClick={handleLogout}
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

        {/* 设置内容 */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="soft-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {section.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {section.description}
            </p>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === "toggle" && (
                        settings[item.id as keyof typeof settings] ? (
                          <Sun className="w-4 h-4 text-accent-foreground" />
                        ) : (
                          <Moon className="w-4 h-4 text-muted-foreground" />
                        )
                      )}
                      {item.type === "button" && item.id === "export" && (
                        <Download className="w-4 h-4 text-muted-foreground" />
                      )}
                      {item.type === "button" && item.id === "clear" && (
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      )}
                      {item.type === "button" && item.id === "privacy" && (
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      )}
                      {item.type === "button" && item.id === "version" && (
                        <Info className="w-4 h-4 text-muted-foreground" />
                      )}
                      <label className="text-sm font-medium text-foreground">
                        {item.label}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  {item.type === "toggle" && (
                    <button
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings[item.id as keyof typeof settings]
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                      onClick={() => toggleSetting(item.id as keyof typeof settings)}
                      aria-label={item.label}
                      aria-pressed={settings[item.id as keyof typeof settings]}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          settings[item.id as keyof typeof settings]
                            ? "translate-x-6"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  )}
                  {item.type === "button" && item.id !== "version" && (
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.id === "clear"
                          ? "bg-destructive text-destructive-foreground hover:opacity-90"
                          : "btn-secondary"
                      }`}
                      onClick={() => handleAction(item.id)}
                    >
                      {item.id === "export" ? "导出" : item.id === "clear" ? "清除" : "查看"}
                    </button>
                  )}
                  {item.type === "button" && item.id === "version" && (
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 关于卡片 */}
        <div className="soft-card p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">UIUE</h2>
          <p className="text-muted-foreground mb-4">
            注重隐私的个人成长工具 · 任务管理 · 知识沉淀 · 日历聚合
          </p>
          <p className="text-xs text-muted-foreground">
            所有数据保存在你的设备本地 • 端到端隐私保护
          </p>
        </div>

        {/* 退出登录 */}
        <div className="soft-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                退出登录
              </h3>
              <p className="text-sm text-muted-foreground">
                退出当前账户，清除本地会话
              </p>
            </div>
            <button
              className="btn-secondary text-destructive border-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              退出登录
            </button>
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
