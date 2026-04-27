import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchTickets, fetchStats, type Ticket, type Stats } from '../api/client';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import TicketStatusBadge from '../components/ticket/TicketStatusBadge';
import TicketPriorityBadge from '../components/ticket/TicketPriorityBadge';
import Avatar from '../components/ui/Avatar';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketRes, statsRes] = await Promise.allSettled([
          fetchTickets({ page: 1, page_size: 5 }),
          user && ['admin', 'lead'].includes(user.role) ? fetchStats() : Promise.resolve(null),
        ]);
        if (ticketRes.status === 'fulfilled') setRecentTickets(ticketRes.value.tickets);
        if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value as Stats);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-100">
              {greeting()}，{user?.name || user?.email}
            </h1>
            <p className="text-surface-400 mt-1">欢迎回到 IssueTick 工单管理控制台</p>
          </div>
          <button
            onClick={() => navigate('/tickets/new')}
            className="
              self-start xl:self-auto
              h-12 px-5 rounded-lg bg-primary-600 text-white font-medium text-sm
              shadow-sm hover:bg-primary-700 transition-colors duration-150
              flex items-center gap-2 cursor-pointer
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            创建工单
          </button>
        </div>

        {/* Stats Cards (admin/lead only) */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="全部工单" value={stats.total_tickets} color="text-primary-700" bgColor="bg-primary-50" />
            <StatCard label="进行中" value={stats.open_tickets} color="text-amber-700" bgColor="bg-amber-50" />
            <StatCard label="已解决" value={stats.resolved_tickets} color="text-emerald-700" bgColor="bg-emerald-50" />
            <StatCard label="用户数" value={stats.total_users} color="text-sky-700" bgColor="bg-sky-50" />
          </div>
        )}

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>最近工单</CardTitle>
            <button
              onClick={() => navigate('/tickets')}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
            >
              查看全部 →
            </button>
          </CardHeader>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-12 text-surface-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg">暂无工单</p>
              <p className="text-sm mt-1">点击右上角按钮创建您的第一个工单</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="
                    flex items-center gap-4 p-3.5 rounded-lg
                    border border-transparent hover:border-surface-700 hover:bg-surface-900 transition-colors duration-150 cursor-pointer
                    group
                  "
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-surface-500 font-mono">{ticket.ticket_number}</span>
                      <TicketStatusBadge status={ticket.status} />
                      <TicketPriorityBadge priority={ticket.priority} />
                    </div>
                    <h4 className="text-sm font-medium text-surface-200 truncate group-hover:text-surface-100 transition-colors">
                      {ticket.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {ticket.assignee && (
                      <Avatar name={ticket.assignee.name} url={ticket.assignee.avatar_url} size="sm" />
                    )}
                    <div className="text-xs text-surface-500">
                      {new Date(ticket.created_at).toLocaleDateString('zh-CN')}
                    </div>
                    <svg className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg ${bgColor} border border-surface-700 flex items-center justify-center`}>
          <span className={`text-lg font-bold ${color}`}>{value}</span>
        </div>
        <div>
          <p className="text-sm text-surface-400">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
