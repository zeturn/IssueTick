import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { fetchTickets, fetchStats, type Ticket, type Stats } from '../api/client';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import TicketStatusBadge from '../components/ticket/TicketStatusBadge';
import TicketPriorityBadge from '../components/ticket/TicketPriorityBadge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Button as WcButton } from '@zeturn/watercolor-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, formatDate } = useI18n();
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
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto px-1">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-100">
              {greeting()}，{user?.name || user?.email}
            </h1>
            <p className="text-sm text-surface-400 mt-1">{t('dashboard.welcome')}</p>
          </div>
          <Button variant="primary" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          } onClick={() => navigate('/tickets/new')}>
            {t('dashboard.createTicket')}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t('dashboard.stat.all')} value={stats.total_tickets} accent="#2563eb" />
            <StatCard label={t('dashboard.stat.open')} value={stats.open_tickets} accent="#d97706" />
            <StatCard label={t('dashboard.stat.resolved')} value={stats.resolved_tickets} accent="#059669" />
            <StatCard label={t('dashboard.stat.users')} value={stats.total_users} accent="#0284c7" />
          </div>
        )}

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recent')}</CardTitle>
            <WcButton variant="text" size="sm" onClick={() => navigate('/tickets')}>
              {t('dashboard.viewAll')} &rarr;
            </WcButton>
          </CardHeader>

          {loading ? (
            <div className="space-y-3 p-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-surface-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-12 text-surface-500">
              <svg className="w-14 h-14 mx-auto mb-3 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">{t('dashboard.empty.title')}</p>
              <p className="text-sm mt-1">{t('dashboard.empty.desc')}</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="flex items-center gap-3 px-1 py-3 cursor-pointer hover:bg-surface-900 rounded-md transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs text-surface-500 font-mono">{ticket.ticket_number}</span>
                      <TicketStatusBadge status={ticket.status} />
                      <TicketPriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="text-sm font-medium text-surface-200 truncate group-hover:text-white transition-colors">
                      {ticket.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {ticket.assignee && <Avatar name={ticket.assignee.name} url={ticket.assignee.avatar_url} size="sm" />}
                    <span className="text-xs text-surface-500 whitespace-nowrap hidden sm:inline">
                      {formatDate(ticket.created_at)}
                    </span>
                    <svg className="w-3.5 h-3.5 text-surface-600 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card>
      <div className="py-1">
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold mt-1" style={{ color: accent }}>{value}</p>
      </div>
    </Card>
  );
}
