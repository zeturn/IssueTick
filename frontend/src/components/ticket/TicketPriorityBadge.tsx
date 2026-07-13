import Badge from '../ui/Badge';
import { useI18n } from '../../i18n';

const priorityVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export default function TicketPriorityBadge({ priority }: { priority: string }) {
  const { t } = useI18n();
  const variant = priorityVariant[priority] || 'default';
  const label = t(`priority.${priority}`) || priority;
  return <Badge variant={variant}>{label}</Badge>;
}
