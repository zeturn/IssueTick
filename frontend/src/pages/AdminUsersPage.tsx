import { useEffect, useState } from 'react';
import { fetchUsers, updateUserRole, type User } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const roleOptions = [
  { value: 'user', labelKey: 'role.user' },
  { value: 'handler', labelKey: 'role.handler' },
  { value: 'lead', labelKey: 'role.lead' },
  { value: 'admin', labelKey: 'role.admin' },
];

const roleBadgeVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  user: 'default',
  handler: 'info',
  lead: 'warning',
  admin: 'danger',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { t, formatDate } = useI18n();
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
          <h1 className="text-3xl font-bold text-surface-100">{t('users.title')}</h1>
          <p className="text-surface-400 mt-1">{t('users.subtitle')}</p>
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
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('users.col.user')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('users.col.email')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('users.col.role')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('users.col.registered')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('users.col.actions')}</th>
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
                        {t(`role.${user.role}`)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-surface-500">
                      {user.created_at ? formatDate(user.created_at) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {currentUser && user.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditUser(user); setNewRole(user.role); }}
                        >
                          {t('users.editRole')}
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
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={t('users.modal.title')}>
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
              label={t('users.field.newRole')}
              options={roleOptions.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdate} className="flex-1">{t('users.confirm')}</Button>
              <Button variant="secondary" onClick={() => setEditUser(null)}>{t('create.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
