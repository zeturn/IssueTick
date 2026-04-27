import { useEffect, useState } from 'react';
import { fetchStats, type Stats } from '../api/client';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';

const statusLabels: Record<string, string> = {
  new: '新建',
  assigned: '已分配',
  in_progress: '处理中',
  pending_user: '待用户回复',
  resolved: '已解决',
  closed: '已关闭',
  cancelled: '已取消',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  assigned: 'bg-cyan-500',
  in_progress: 'bg-amber-500',
  pending_user: 'bg-orange-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
};

export default function AdminDashboardPage() {
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
          <h1 className="text-3xl font-bold text-surface-100">管理面板</h1>
          <p className="text-surface-400 mt-1">系统运行概览</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="全部工单" value={stats.total_tickets} color="text-primary-700" />
          <StatCard label="进行中" value={stats.open_tickets} color="text-amber-700" />
          <StatCard label="已解决" value={stats.resolved_tickets} color="text-emerald-700" />
          <StatCard label="已关闭" value={stats.closed_tickets} color="text-surface-300" />
          <StatCard label="注册用户" value={stats.total_users} color="text-sky-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* By Status */}
          <Card>
            <CardHeader><CardTitle>按状态分布</CardTitle></CardHeader>
            <div className="space-y-3">
              {Object.entries(stats.by_status).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 w-20">{statusLabels[status] || status}</span>
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
            <CardHeader><CardTitle>按优先级分布</CardTitle></CardHeader>
            <div className="space-y-3">
              {Object.entries(stats.by_priority).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 w-12">{priorityLabels[priority] || priority}</span>
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
