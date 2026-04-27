'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get('id');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      if (!analysisId) return null;
      // Fetch analysis details
      return null;
    },
    enabled: !!analysisId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Channel Analytics</h1>
        <p className="text-gray-400">View detailed performance metrics and insights</p>
      </div>

      {!analysisId ? (
        <div className="card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">
            Select an analysis from your dashboard or analyze a new channel.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        </div>
      ) : analysis ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Analysis details would go here */}
          <div className="lg:col-span-2 card">
            <p className="text-gray-400">Analysis data loaded successfully.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-primary w-full">Generate Content Ideas</button>
              <button className="btn-secondary w-full">Compare Competitors</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Analysis not found.</p>
        </div>
      )}
    </div>
  );
}
