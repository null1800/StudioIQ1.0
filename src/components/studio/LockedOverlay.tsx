import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LockedOverlayProps {
  isLocked: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function LockedOverlay({ 
  isLocked, 
  title = "Premium Feature", 
  description = "Upgrade to unlock this feature.", 
  children 
}: LockedOverlayProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl group">
      <div className="blur-md opacity-40 pointer-events-none select-none transition-all duration-300 group-hover:blur-xl">
        {children}
      </div>
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark-900/60 backdrop-blur-[2px]">
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 md:p-8 max-w-sm w-[90%] text-center shadow-2xl transform transition-transform group-hover:scale-105">
          <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
            <Lock className="w-6 h-6 text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-6 text-sm">
            {description}
          </p>
          <Link href="/dashboard/billing" className="btn-primary w-full inline-block">
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
