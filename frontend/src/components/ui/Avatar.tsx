interface AvatarProps {
  name?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const gradients = [
  'from-primary-600 to-primary-500',
  'from-emerald-700 to-emerald-500',
  'from-amber-700 to-orange-500',
  'from-slate-700 to-slate-500',
  'from-sky-700 to-sky-500',
  'from-red-700 to-red-500',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Avatar({ name = '', url, size = 'md', className = '' }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full
        bg-gradient-to-br ${getGradient(name)}
        flex items-center justify-center
        font-semibold text-white
        ring-2 ring-white
        ${className}
      `}
    >
      {getInitials(name || '?')}
    </div>
  );
}
