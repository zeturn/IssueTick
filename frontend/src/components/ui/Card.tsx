import type { ReactNode } from 'react';
import { Card as WcCard } from '@zeturn/watercolor-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <WcCard
      variant="outlined"
      interactive={hover || !!onClick}
      onClick={onClick}
      className={className}
    >
      {children}
    </WcCard>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold text-surface-100 ${className}`}>{children}</h3>;
}
