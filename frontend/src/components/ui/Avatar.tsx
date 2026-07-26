import { Avatar as WcAvatar } from '@zeturn/watercolor-react';

interface AvatarProps {
  name?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = '', url, size = 'md', className = '' }: AvatarProps) {
  return (
    <WcAvatar
      src={url}
      alt={name}
      size={size}
      variant="circular"
      className={className}
    >
      {!url ? getInitials(name || '?') : null}
    </WcAvatar>
  );
}
