import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        <p className="text-gray-400">Loading StudioIQ...</p>
      </div>
    </div>
  );
}
