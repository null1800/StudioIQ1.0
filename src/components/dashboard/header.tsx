'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Coins, Bell, Menu, X, Sparkles } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { cn, formatNumber } from '@/lib/utils';

interface TokenData {
  balance: number;
  dailyUsage: {
    channel_analyses: number;
    content_ideas: number;
  };
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: tokenData } = useQuery<TokenData>({
    queryKey: ['tokens'],
    queryFn: async () => {
      const res = await fetch('/api/tokens');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  return (
    <>
      <header className="h-16 bg-dark-800/80 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Logo */}
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">StudioIQ</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Token Balance */}
            <Link
              href="/dashboard/tokens"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Coins className="w-4 h-4 text-brand-400" />
              <span className="text-brand-400 font-semibold">
                {tokenData?.balance !== undefined ? formatNumber(tokenData.balance) : '...'}
              </span>
              <span className="text-gray-500 text-sm">tokens</span>
            </Link>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
            </button>

            {/* User Avatar & Profile Management */}
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              }
            }} />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-dark-900 pt-16">
          <nav className="p-4 space-y-1">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/dashboard/analytics', label: 'Analytics' },
              { href: '/dashboard/content', label: 'Content Ideas' },
              { href: '/dashboard/scripts', label: 'Scripts' },
              { href: '/dashboard/studio', label: 'Studio' },
              { href: '/dashboard/tokens', label: 'Tokens' },
              { href: '/dashboard/settings', label: 'Settings' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
