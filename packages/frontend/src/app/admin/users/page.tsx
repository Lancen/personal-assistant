'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User } from '@personal-assistant/types';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminUsersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    isAdmin: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadUsers();
  }, [isAuthenticated, router]);

  async function loadUsers() {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      password: '',
      isAdmin: false,
      isActive: true,
    });
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!formData.email || !formData.name || (!editingUser && !formData.password)) {
      alert('请填写所有必填字段');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingUser
        ? `${API_BASE}/api/admin/users/${editingUser.id}`
        : `${API_BASE}/api/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        loadUsers();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`确定要删除用户 "${user.email}" 吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        loadUsers();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败，请重试');
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 -ml-2 text-primary hover:text-accent cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          新增用户
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-primary/60">加载中...</div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12 text-primary/60">
          <p>暂无用户</p>
          <button
            onClick={openCreateModal}
            className="btn-primary inline-flex mt-4 cursor-pointer"
          >
            添加第一个用户
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-foreground">邮箱</th>
                <th className="text-left p-4 font-medium text-foreground">名称</th>
                <th className="text-left p-4 font-medium text-foreground">角色</th>
                <th className="text-left p-4 font-medium text-foreground">状态</th>
                <th className="text-right p-4 font-medium text-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-foreground">{user.email}</td>
                  <td className="p-4 text-foreground">{user.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isAdmin
                        ? 'bg-accent/10 text-accent'
                        : 'bg-muted text-primary'
                    }`}>
                      {user.isAdmin ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-primary hover:text-accent cursor-pointer"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-destructive hover:text-destructive/80 cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {editingUser ? '编辑用户' : '新增用户'}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="张三"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  密码 {editingUser && <span className="text-xs text-primary/60">(留空不修改)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input w-full"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="accent-accent"
                />
                <label htmlFor="isAdmin" className="text-sm text-foreground cursor-pointer">
                  管理员权限
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="accent-accent"
                />
                <label htmlFor="isActive" className="text-sm text-foreground cursor-pointer">
                  启用
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary cursor-pointer"
              >
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
