import type { ReactNode } from 'react';
import { Badge as WcBadge } from '@zeturn/watercolor-react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

// watercolor uses 'error' for the danger/red semantic.
const variantMap: Record<BadgeVariant, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  default: 'default',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'error',
  info: 'info',
};

export default function Badge({ variant = 'default', children, className = '', dot = false }: BadgeProps) {
  return (
    <WcBadge variant={variantMap[variant]} dot={dot} className={className}>
      {children}
    </WcBadge>
  );
}
