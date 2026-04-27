import Badge from '../ui/Badge';

const statusConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  new: { label: '新建', variant: 'info' },
  assigned: { label: '已分配', variant: 'primary' },
  in_progress: { label: '处理中', variant: 'warning' },
  pending_user: { label: '待用户回复', variant: 'warning' },
  resolved: { label: '已解决', variant: 'success' },
  closed: { label: '已关闭', variant: 'default' },
  cancelled: { label: '已取消', variant: 'danger' },
};

export default function TicketStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
