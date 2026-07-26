import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen console-shell text-surface-100">
      <Sidebar />
      <main className="min-h-screen md:ml-[240px] flex justify-center">
        <div className="w-full max-w-[1380px] p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
