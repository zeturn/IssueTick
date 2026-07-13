import Badge from '../ui/Badge';
import { useI18n } from '../../i18n';

const statusVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  new: 'info',
  assigned: 'primary',
  in_progress: 'warning',
  pending_user: 'warning',
  resolved: 'success',
  closed: 'default',
  cancelled: 'danger',
};

export default function TicketStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const variant = statusVariant[status] || 'default';
  const label = t(`status.${status}`) || status;
  return <Badge variant={variant} dot>{label}</Badge>;
}
