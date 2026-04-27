'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Video,
  Layers,
  Wallet,
  Settings,
  HelpCircle,
  Sparkles as LogoIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/content', label: 'Content Ideas', icon: Sparkles },
  { href: '/dashboard/scripts', label: 'Scripts', icon: Video },
  { href: '/dashboard/studio', label: 'Studio', icon: Layers },
  { href: '/dashboard/tokens', label: 'Tokens', icon: Wallet },
];

const bottomItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/help', label: 'Help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-dark-700 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-dark-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">StudioIQ</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-dark-700 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
