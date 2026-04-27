import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTickets, type Ticket } from '../api/client';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import TicketStatusBadge from '../components/ticket/TicketStatusBadge';
import TicketPriorityBadge from '../components/ticket/TicketPriorityBadge';
import Avatar from '../components/ui/Avatar';

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'new', label: '新建' },
  { value: 'assigned', label: '已分配' },
  { value: 'in_progress', label: '处理中' },
  { value: 'pending_user', label: '待用户回复' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' },
  { value: 'cancelled', label: '已取消' },
];

const priorityOptions = [
  { value: '', label: '全部优先级' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
];

export default function TicketListPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const pageSize = 15;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchTickets({
        page,
        page_size: pageSize,
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
      });
      setTickets(res.tickets);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, status, priority]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-100">工单列表</h1>
            <p className="text-surface-400 mt-1">共 {total} 条工单</p>
          </div>
          <Button onClick={() => navigate('/tickets/new')} className="self-start xl:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            创建工单
          </Button>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索工单标题或编号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
              />
            </div>
            <div className="w-40">
              <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} />
            </div>
            <div className="w-36">
              <Select options={priorityOptions} value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} />
            </div>
            <Button variant="secondary" onClick={() => { setPage(1); load(); }}>
              搜索
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 border-b border-surface-700 animate-pulse bg-surface-800" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-surface-500">
              <p className="text-lg mb-2">没有找到工单</p>
              <p className="text-sm">尝试调整筛选条件，或创建一个新工单</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-900 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wide">工单</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wide">状态</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wide">优先级</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wide">分类</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wide">处理人</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wide">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="border-b border-surface-700 hover:bg-surface-900 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-xs text-surface-500 font-mono block mb-0.5">{ticket.ticket_number}</span>
                        <span className="text-sm font-medium text-surface-200 group-hover:text-surface-100 transition-colors">
                          {ticket.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-4">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-5 py-4">
                      {ticket.category ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: ticket.category.color }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                          {ticket.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-surface-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={ticket.assignee.name} url={ticket.assignee.avatar_url} size="sm" />
                          <span className="text-xs text-surface-400">{ticket.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-surface-600">未分配</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-surface-500">
                      {new Date(ticket.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-700/70">
              <span className="text-sm text-surface-500">
                第 {page} / {totalPages} 页
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
