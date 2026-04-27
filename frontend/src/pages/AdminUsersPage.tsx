import { useEffect, useState } from 'react';
import { fetchUsers, updateUserRole, type User } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const roleOptions = [
  { value: 'user', label: '普通用户' },
  { value: 'handler', label: '处理人员' },
  { value: 'lead', label: '组长/主管' },
  { value: 'admin', label: '管理员' },
];

const roleBadgeVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  user: 'default',
  handler: 'info',
  lead: 'warning',
  admin: 'danger',
};

const roleLabels: Record<string, string> = {
  user: '普通用户',
  handler: '处理人员',
  lead: '组长',
  admin: '管理员',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  const load = async () => {
    try {
      const u = await fetchUsers();
      setUsers(u);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async () => {
    if (!editUser || !newRole) return;
    try {
      await updateUserRole(editUser.id, newRole);
      setEditUser(null);
      await load();
    } catch { /* ignore */ }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">用户管理</h1>
          <p className="text-surface-400 mt-1">管理系统用户及其角色权限</p>
        </div>

        <Card className="!p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 border-b border-surface-700 animate-pulse bg-surface-800" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-900 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">用户</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">邮箱</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">角色</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">注册时间</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-surface-700">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name || user.email} url={user.avatar_url} size="sm" />
                        <span className="text-sm text-surface-200 font-medium">
                          {user.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-surface-400">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={roleBadgeVariant[user.role] || 'default'}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-surface-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {currentUser && user.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditUser(user); setNewRole(user.role); }}
                        >
                          修改角色
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Role Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="修改用户角色">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface-900 rounded-lg border border-surface-700">
              <Avatar name={editUser.name || editUser.email} url={editUser.avatar_url} />
              <div>
                <p className="text-sm font-medium text-surface-200">{editUser.name || editUser.email}</p>
                <p className="text-xs text-surface-500">{editUser.email}</p>
              </div>
            </div>
            <Select
              label="新角色"
              options={roleOptions}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdate} className="flex-1">确认修改</Button>
              <Button variant="secondary" onClick={() => setEditUser(null)}>取消</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
