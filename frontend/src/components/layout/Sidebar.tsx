import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const navItems = [
  { path: '/', label: '工作台', icon: DashboardIcon, roles: ['user', 'handler', 'lead', 'admin'] },
  { path: '/tickets', label: '工单列表', icon: TicketIcon, roles: ['user', 'handler', 'lead', 'admin'] },
  { path: '/tickets/new', label: '创建工单', icon: PlusIcon, roles: ['user', 'handler', 'lead', 'admin'] },
  { path: '/admin', label: '管理概览', icon: AdminIcon, roles: ['admin', 'lead'] },
  { path: '/admin/categories', label: '分类管理', icon: CategoryIcon, roles: ['admin'] },
  { path: '/admin/users', label: '用户管理', icon: UsersIcon, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="hidden fixed left-0 top-0 z-40 h-screen w-[240px] flex-col border-r border-surface-700 bg-[#f7f7f8] md:flex">
      <div className="flex h-20 items-center gap-3 border-b border-surface-700 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f48120] text-white shadow-sm">
          <CloudIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-surface-100">{user?.email || 'IssueTick'}</p>
          <p className="text-xs capitalize text-surface-400">{user?.role || 'workspace'}</p>
        </div>
      </div>

      <div className="border-b border-surface-700 p-4">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-surface-700 bg-white px-3 text-sm text-surface-400 shadow-sm">
          <SearchIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">快速搜索...</span>
          <span className="ml-auto text-xs text-surface-500">Ctrl K</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNav.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-white text-surface-100 shadow-sm ring-1 ring-surface-700'
                : 'text-surface-300 hover:bg-white hover:text-surface-100'
              }
              ${index === 3 ? 'mt-4' : ''}
            `}
          >
            <item.icon className="h-5 w-5 shrink-0 text-surface-400" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-700 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user?.name || user?.email || '?'} url={user?.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-surface-200">{user?.name || user?.email}</p>
            <p className="text-xs text-surface-500">当前账户</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-surface-400 transition-colors hover:bg-white hover:text-red-700"
        >
          <LogoutIcon className="h-5 w-5 shrink-0" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.3 17.5a4.8 4.8 0 0 1 0-9.6h.5a6.3 6.3 0 0 1 12.1 2.1A3.9 3.9 0 0 1 19 17.5H7.3Z" />
      <path d="M3.8 18.4a3.2 3.2 0 0 1 2.4-5.3h1.1a3.9 3.9 0 0 0 0 7.8h11.4a3.4 3.4 0 0 1-2.8 1.5H6.4a3.2 3.2 0 0 1-2.6-4Z" opacity=".85" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v2.2a2.3 2.3 0 0 0 0 4.6v2.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2.2a2.3 2.3 0 0 0 0-4.6V7.5Z" />
      <path strokeLinecap="round" d="M9 10h5M9 14h3" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  );
}

function CategoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l10 10-6 6L4 10V6.5Z" />
      <path strokeLinecap="round" d="M8 8h.01" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 19a4 4 0 0 0-8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 18a3.2 3.2 0 0 0-4-3.1M8 14.9A3.2 3.2 0 0 0 4 18" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8V6.5A1.5 1.5 0 0 0 13.5 5h-7A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19h7a1.5 1.5 0 0 0 1.5-1.5V16M12 12h8m0 0-3-3m3 3-3 3" />
    </svg>
  );
}
