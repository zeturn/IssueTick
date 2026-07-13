import { useEffect, useState } from 'react';
import { fetchStats, type Stats } from '../api/client';
import { useI18n } from '../i18n';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  assigned: 'bg-cyan-500',
  in_progress: 'bg-amber-500',
  pending_user: 'bg-orange-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
};

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-surface-800 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-surface-800/50 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  const totalByStatus = Object.values(stats.by_status).reduce((a, b) => a + b, 0) || 1;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">{t('admin.title')}</h1>
          <p className="text-surface-400 mt-1">{t('admin.subtitle')}</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label={t('admin.stat.all')} value={stats.total_tickets} color="text-primary-700" />
          <StatCard label={t('admin.stat.open')} value={stats.open_tickets} color="text-amber-700" />
          <StatCard label={t('admin.stat.resolved')} value={stats.resolved_tickets} color="text-emerald-700" />
          <StatCard label={t('admin.stat.closed')} value={stats.closed_tickets} color="text-surface-300" />
          <StatCard label={t('admin.stat.users')} value={stats.total_users} color="text-sky-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* By Status */}
          <Card>
            <CardHeader><CardTitle>{t('admin.byStatus')}</CardTitle></CardHeader>
            <div className="space-y-3">
              {Object.entries(stats.by_status).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 w-20">{t(`status.${status}`) || status}</span>
                  <div className="flex-1 h-3 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[status] || 'bg-surface-600'} transition-all duration-500`}
                      style={{ width: `${Math.max((count / totalByStatus) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-surface-200 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* By Priority */}
          <Card>
            <CardHeader><CardTitle>{t('admin.byPriority')}</CardTitle></CardHeader>
            <div className="space-y-3">
              {Object.entries(stats.by_priority).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 w-12">{t(`priority.${priority}`) || priority}</span>
                  <div className="flex-1 h-3 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${priorityColors[priority] || 'bg-surface-600'} transition-all duration-500`}
                      style={{ width: `${Math.max((count / totalByStatus) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-surface-200 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <div>
        <p className="text-sm text-surface-400 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>
          {value}
        </p>
      </div>
    </Card>
  );
}
