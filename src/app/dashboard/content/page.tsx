'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { IdeaFeed } from '@/components/ai/IdeaFeed';
import { PredefinedIdeas } from '@/components/ai/PredefinedIdeas';
import { supabase } from '@/lib/supabase';

export default function ContentPage() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  
  // Fetch user's recent analyses
  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['recent-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channel_analyses')
        .select('id, youtube_channels(title)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch previously generated ideas for selected analysis
  const { data: existingIdeas, refetch: refetchIdeas, isLoading: isLoadingIdeas } = useQuery({
    queryKey: ['content-ideas', selectedAnalysisId],
    enabled: !!selectedAnalysisId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('channel_analysis_id', selectedAnalysisId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate-ideas',
          analysisId: selectedAnalysisId
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate ideas');
      }
      return res.json();
    },
    onSuccess: () => {
      refetchIdeas();
    }
  });

  const savePredefinedMutation = useMutation({
    mutationFn: async (idea: any) => {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'save-idea',
          idea,
          analysisId: selectedAnalysisId || undefined
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save template');
      }
      return res.json();
    },
    onSuccess: () => {
      refetchIdeas();
    }
  });

  // Set initial selected analysis
  useEffect(() => {
    if (analyses && analyses.length > 0 && !selectedAnalysisId) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses, selectedAnalysisId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Ideas</h1>
          <p className="text-gray-400">AI-generated video concepts based on your niche</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select 
            className="input py-2 text-sm max-w-xs"
            value={selectedAnalysisId}
            onChange={(e) => setSelectedAnalysisId(e.target.value)}
            disabled={isLoadingAnalyses || generateMutation.isPending}
          >
            <option value="">Select a channel analysis...</option>
            {analyses?.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.youtube_channels?.title || 'Unknown Channel'} - {new Date().toLocaleDateString()}
              </option>
            ))}
          </select>

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedAnalysisId}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Ideas (5 tokens)
              </>
            )}
          </button>
        </div>
      </div>

      {generateMutation.isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">
            {generateMutation.error instanceof Error ? generateMutation.error.message : 'Generation failed'}
          </p>
        </div>
      )}

      {isLoadingIdeas && !!selectedAnalysisId ? (
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading your ideas...</p>
        </div>
      ) : existingIdeas && existingIdeas.length > 0 ? (
        <IdeaFeed 
          ideas={existingIdeas} 
          onGenerateScript={(id) => window.location.href = `/dashboard/scripts?idea=${id}`}
          onGenerateThumbnail={(id) => console.log('Generate thumbnail for', id)}
        />
      ) : (
        <div className="card p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {!selectedAnalysisId 
              ? "Select a channel analysis to get started." 
              : "No ideas generated for this analysis yet."}
          </p>
          {selectedAnalysisId && (
            <p className="text-sm text-gray-500">
              Click the Generate Ideas button above to create AI-powered video concepts.
            </p>
          )}
        </div>
      )}

      {savePredefinedMutation.isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">
            {savePredefinedMutation.error instanceof Error ? savePredefinedMutation.error.message : 'Save failed'}
          </p>
        </div>
      )}

      <PredefinedIdeas onSave={async (idea) => await savePredefinedMutation.mutateAsync(idea)} />
    </div>
  );
}
