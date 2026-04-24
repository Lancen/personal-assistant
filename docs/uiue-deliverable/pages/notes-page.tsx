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
  Search,
  Grid,
  List,
  Trash2,
  Edit,
  Pin,
  PinOff,
  LogOut,
} from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = "card" | "list";

const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, active: false },
  { id: "tasks", label: "任务管理", icon: CheckSquare, active: false },
  { id: "mood", label: "情绪记录", icon: Smile, active: false },
  { id: "notes", label: "知识笔记", icon: BookOpen, active: true },
  { id: "calendar", label: "日历", icon: Calendar, active: false },
  { id: "settings", label: "设置", icon: Settings, active: false },
];

// 初始模拟数据
const initialNotes: Note[] = [
  {
    id: "1",
    title: "每日冥想要点",
    content: "冥想最重要的是持续练习，不需要追求完美。每天10分钟比周末两小时更有效。注意呼吸，觉察思绪，不评判，只是观察。",
    tags: ["冥想", "成长"],
    isPinned: true,
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "2",
    title: "阅读笔记：原子习惯",
    content: "微小习惯重复做，自然而然带来改变。环境设计比意志力更重要。改变1%，一年后变化很大。",
    tags: ["阅读", "习惯"],
    isPinned: false,
    createdAt: "2026-04-18T15:30:00Z",
    updatedAt: "2026-04-18T15:30:00Z",
  },
  {
    id: "3",
    title: "情绪调节小技巧",
    content: "1. 深呼吸478呼吸法 2. 5分钟散步 3. 写下情绪 4. 喝一杯温水",
    tags: ["情绪", "自我调节"],
    isPinned: false,
    createdAt: "2026-04-15T09:20:00Z",
    updatedAt: "2026-04-15T09:20:00Z",
  },
];

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState({
    title: "",
    content: "",
    tags: "",
    isPinned: false,
  });

  // 获取所有标签
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags))
  );

  // 过滤笔记
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !activeTag || note.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // 置顶优先
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 然后按更新时间倒序
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleAdd = () => {
    setEditingId(null);
    setCurrentNote({
      title: "",
      content: "",
      tags: "",
      isPinned: false,
    });
    setShowAddModal(true);
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setCurrentNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
      isPinned: note.isPinned,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这篇笔记吗？")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, isPinned: !note.isPinned }
        : note
    ));
  };

  const handleSave = () => {
    if (!currentNote.title.trim()) {
      alert("标题不能为空");
      return;
    }

    const tagsArray = currentNote.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    if (editingId) {
      // 编辑
      setNotes(notes.map(note =>
        note.id === editingId
          ? {
              ...note,
              title: currentNote.title,
              content: currentNote.content,
              tags: tagsArray,
              isPinned: currentNote.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      ));
    } else {
      // 新建
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentNote.title,
        content: currentNote.content,
        tags: tagsArray,
        isPinned: currentNote.isPinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
    }

    setShowAddModal(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN");
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
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
                  <BookOpen className="w-4 h-4 ml-auto" />
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
              知识笔记
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

        {/* 内容 */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* 顶部操作栏 */}
          <div className="soft-card p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* 搜索框 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索笔记..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
              {/* 视图切换 */}
              <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
                <button
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "card"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setViewMode("card")}
                  aria-label="卡片视图"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setViewMode("list")}
                  aria-label="列表视图"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              {/* 新建按钮 */}
              <button
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
                onClick={handleAdd}
              >
                <Plus className="w-4 h-4" />
                <span>新建笔记</span>
              </button>
            </div>

            {/* 标签筛选 */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                <button
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    activeTag === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveTag(null)}
                >
                  全部
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      activeTag === tag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 笔记列表 */}
          {filteredNotes.length === 0 ? (
            <div className="soft-card p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                暂无笔记
              </h3>
              <p className="text-muted-foreground mb-6">
                创建你的第一篇笔记，开始沉淀知识吧
              </p>
              <button className="btn-primary inline-flex items-center gap-2" onClick={handleAdd}>
                <Plus className="w-4 h-4" />
                <span>新建笔记</span>
              </button>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`soft-card p-5 transition-all hover:shadow-soft-lg ${
                    note.isPinned ? "border-primary/50 ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {note.title}
                    </h3>
                    <button
                      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                      onClick={() => togglePin(note.id)}
                      aria-label={note.isPinned ? "取消置顶" : "置顶"}
                    >
                      {note.isPinned ? (
                        <Pin className="w-4 h-4 text-primary fill-current" />
                      ) : (
                        <PinOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {truncateContent(note.content, 120)}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                        onClick={() => handleEdit(note)}
                        aria-label="编辑笔记"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                        onClick={() => handleDelete(note.id)}
                        aria-label="删除笔记"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="soft-card divide-y divide-border">
              {filteredNotes.map(note => (
                <div key={note.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {note.isPinned && (
                          <Pin className="w-4 h-4 text-primary fill-current" />
                        )}
                        <h3 className="font-semibold text-foreground truncate">
                          {note.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {truncateContent(note.content, 160)}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.updatedAt)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                          onClick={() => togglePin(note.id)}
                          aria-label={note.isPinned ? "取消置顶" : "置顶"}
                        >
                          {note.isPinned ? (
                            <PinOff className="w-4 h-4" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                          onClick={() => handleEdit(note)}
                          aria-label="编辑笔记"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                          onClick={() => handleDelete(note.id)}
                          aria-label="删除笔记"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* 新建/编辑模态框 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-soft-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">
                  {editingId ? "编辑笔记" : "新建笔记"}
                </h3>
                <button
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setShowAddModal(false)}
                  aria-label="关闭"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="note-title" className="form-label">
                    笔记标题
                  </label>
                  <input
                    id="note-title"
                    type="text"
                    value={currentNote.title}
                    onChange={(e) =>
                      setCurrentNote({ ...currentNote, title: e.target.value })
                    }
                    className="form-input w-full"
                    placeholder="输入笔记标题"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="note-content" className="form-label">
                    笔记内容
                  </label>
                  <textarea
                    id="note-content"
                    value={currentNote.content}
                    onChange={(e) =>
                      setCurrentNote({ ...currentNote, content: e.target.value })
                    }
                    className="form-input w-full min-h-[200px]"
                    placeholder="写下你的思考..."
                  />
                </div>
                <div>
                  <label htmlFor="note-tags" className="form-label">
                    标签 (用逗号分隔)
                  </label>
                  <input
                    id="note-tags"
                    type="text"
                    value={currentNote.tags}
                    onChange={(e) =>
                      setCurrentNote({ ...currentNote, tags: e.target.value })
                    }
                    className="form-input w-full"
                    placeholder="阅读, 成长, 思考"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="note-pinned"
                    type="checkbox"
                    checked={currentNote.isPinned}
                    onChange={(e) =>
                      setCurrentNote({ ...currentNote, isPinned: e.target.checked })
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="note-pinned" className="text-sm font-medium text-foreground">
                    置顶笔记
                  </label>
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
                  type="button"
                  className="btn-primary flex-1"
                  onClick={handleSave}
                  disabled={!currentNote.title.trim()}
                >
                  {editingId ? "保存修改" : "创建笔记"}
                </button>
              </div>
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
