import Badge from '../ui/Badge';

const priorityConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  low: { label: '低', variant: 'default' },
  medium: { label: '中', variant: 'info' },
  high: { label: '高', variant: 'warning' },
  urgent: { label: '紧急', variant: 'danger' },
};

export default function TicketPriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || { label: priority, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
