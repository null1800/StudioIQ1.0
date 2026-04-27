'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  BarChart3, 
  Sparkles, 
  Video, 
  TrendingUp, 
  Users, 
  Eye,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  totalAnalyses: number;
  contentIdeas: number;
  scripts: number;
  recentAnalyses: Analysis[];
}

interface Analysis {
  id: string;
  niche: string | null;
  content_style: string | null;
  engagement_rate: number | null;
  avg_views_per_video: number | null;
  created_at: string;
  youtube_channels: {
    title: string;
    thumbnail_url: string | null;
    subscriber_count: number | null;
  } | null;
}

export default function DashboardPage() {
  const [channelUrl, setChannelUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // In production, this would fetch from an API endpoint
      return {
        totalAnalyses: 0,
        contentIdeas: 0,
        scripts: 0,
        recentAnalyses: [],
      };
    },
  });

  const { data: tokenData } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const res = await fetch('/api/tokens');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: url }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Analysis failed');
      }
      return res.json();
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    const input = channelUrl.trim();
    if (!input) {
      setValidationError("Please enter a YouTube channel URL or handle.");
      return;
    }
    
    if (input.startsWith('http')) {
      try {
        const url = new URL(input);
        if (!url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be')) {
          setValidationError("Please enter a valid YouTube URL (must contain youtube.com).");
          return;
        }
      } catch {
        setValidationError("Please enter a valid URL.");
        return;
      }
    } else if (input.includes(' ')) {
      setValidationError("Handles and IDs cannot contain spaces. Use @handle or a valid URL.");
      return;
    }

    analyzeMutation.mutate(input);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Analyze your channel and generate content ideas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg border border-dark-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">YouTube API Connected</span>
          </div>
        </div>
      </div>

      {/* Channel Input */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2">
          <Search className="w-5 h-5 text-brand-400" />
          Analyze YouTube Channel
        </h2>
        <p className="text-gray-400 mb-4">
          Enter a channel URL or name to get started with real performance analytics.
        </p>
        <form onSubmit={handleAnalyze} className="flex gap-3">
          <input
            type="text"
            placeholder="https://youtube.com/@channelname or channel name"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            className="input flex-1"
            disabled={analyzeMutation.isPending}
          />
          <button
            type="submit"
            disabled={analyzeMutation.isPending || !channelUrl.trim()}
            className="btn-primary px-6 flex items-center gap-2"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze (3 tokens)
              </>
            )}
          </button>
        </form>

        {(validationError || analyzeMutation.isError) && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">
              {validationError || (analyzeMutation.error instanceof Error ? analyzeMutation.error.message : 'Analysis failed')}
            </p>
          </div>
        )}

        {analyzeMutation.isSuccess && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-medium">Analysis complete!</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                View detailed insights and generate content ideas.
              </p>
              <Link
                href={`/dashboard/analytics?id=${analyzeMutation.data.data.id}`}
                className="btn-primary text-sm"
              >
                View Analysis
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Total Analyses"
          value={stats?.totalAnalyses || 0}
          color="blue"
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Content Ideas"
          value={stats?.contentIdeas || 0}
          color="purple"
        />
        <StatCard
          icon={<Video className="w-5 h-5" />}
          label="Scripts Generated"
          value={stats?.scripts || 0}
          color="pink"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Token Balance"
          value={tokenData?.balance || 0}
          color="green"
          isNumberFormatted={false}
        />
      </div>

      {/* Recent Analyses */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Recent Analyses</h2>
          <Link href="/dashboard/analytics" className="text-brand-400 hover:text-brand-300 text-sm">
            View All
          </Link>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
          <div className="space-y-4">
            {stats.recentAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors"
              >
                <div className="w-12 h-12 bg-brand-500/20 rounded-lg flex items-center justify-center">
                  {analysis.youtube_channels?.thumbnail_url ? (
                    <img
                      src={analysis.youtube_channels.thumbnail_url}
                      alt={analysis.youtube_channels.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-brand-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">
                    {analysis.youtube_channels?.title || 'Unknown Channel'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {analysis.niche} • {analysis.content_style}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {formatNumber(analysis.youtube_channels?.subscriber_count || 0)}
                    </p>
                    <p className="text-gray-500">Subscribers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {analysis.engagement_rate?.toFixed(1)}%
                    </p>
                    <p className="text-gray-500">Engagement</p>
                  </div>
                  <Link
                    href={`/dashboard/analytics?id=${analysis.id}`}
                    className="btn-secondary text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No analyses yet. Analyze your first channel above.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="Content Ideas"
          description="Generate AI-powered video concepts based on your niche"
          icon={<Sparkles className="w-6 h-6" />}
          href="/dashboard/content"
          color="purple"
          tokenCost={5}
        />
        <QuickActionCard
          title="Script Writing"
          description="Get complete video scripts with hooks and CTAs"
          icon={<Video className="w-6 h-6" />}
          href="/dashboard/scripts"
          color="pink"
          tokenCost={8}
        />
        <QuickActionCard
          title="Studio Setup"
          description="Plan realistic or virtual production environments"
          icon={<BarChart3 className="w-6 h-6" />}
          href="/dashboard/studio"
          color="blue"
          tokenCost={10}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  isNumberFormatted = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'pink' | 'green';
  isNumberFormatted?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-brand-500/10 text-brand-400',
    purple: 'bg-accent-purple/10 text-accent-purple',
    pink: 'bg-accent-pink/10 text-accent-pink',
    green: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="stat-value">{isNumberFormatted ? formatNumber(value) : value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
  tokenCost,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'purple' | 'pink';
  tokenCost: number;
}) {
  const colorClasses = {
    blue: 'from-brand-500/20 to-brand-600/20 hover:border-brand-500/50',
    purple: 'from-accent-purple/20 to-accent-purple/30 hover:border-accent-purple/50',
    pink: 'from-accent-pink/20 to-accent-pink/30 hover:border-accent-pink/50',
  };

  return (
    <Link
      href={href}
      className={`card p-6 bg-gradient-to-br ${colorClasses[color]} border border-dark-700 hover:transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-white">{icon}</div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <span className="text-brand-400 font-medium">{tokenCost}</span>
          <span>tokens</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  );
}
