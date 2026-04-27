'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { ScriptPreview } from '@/components/ai/ScriptPreview';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function ScriptsPage() {
  const searchParams = useSearchParams();
  const ideaIdParam = searchParams.get('idea');
  
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(ideaIdParam || '');
  const [tone, setTone] = useState('conversational');
  const [duration, setDuration] = useState(600); // 10 mins

  // Fetch user's content ideas
  const { data: ideas, isLoading: isLoadingIdeas } = useQuery({
    queryKey: ['all-ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_ideas')
        .select('id, title, format, created_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch scripts for selected idea
  const { data: existingScripts, refetch: refetchScripts, isLoading: isLoadingScripts } = useQuery({
    queryKey: ['scripts', selectedIdeaId],
    enabled: !!selectedIdeaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('content_idea_id', selectedIdeaId)
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
          action: 'generate-script',
          ideaId: selectedIdeaId,
          preferences: { tone, duration }
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate script');
      }
      return res.json();
    },
    onSuccess: () => {
      refetchScripts();
    }
  });

  const currentScript = existingScripts && existingScripts.length > 0 ? existingScripts[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Script Generator</h1>
          <p className="text-gray-400">AI-powered video scripts with hooks and CTAs</p>
        </div>

        <div className="card p-4 bg-dark-800 border-dark-700 w-full md:max-w-md space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Select Content Idea
            </label>
            <select 
              className="input py-2 text-sm w-full"
              value={selectedIdeaId}
              onChange={(e) => setSelectedIdeaId(e.target.value)}
              disabled={isLoadingIdeas || generateMutation.isPending}
            >
              <option value="">Select an idea...</option>
              {ideas?.map((idea: any) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title.substring(0, 50)}{idea.title.length > 50 ? '...' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Tone
              </label>
              <select 
                className="input py-2 text-sm w-full"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="educational">Educational</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Length (Mins)
              </label>
              <select 
                className="input py-2 text-sm w-full"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={180}>3 Minutes</option>
                <option value={300}>5 Minutes</option>
                <option value={600}>10 Minutes</option>
                <option value={1200}>20 Minutes</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedIdeaId}
            className="btn-primary w-full flex justify-center items-center gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Generate Script (8 tokens)
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

      {isLoadingScripts ? (
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading script...</p>
        </div>
      ) : currentScript ? (
        <ScriptPreview script={currentScript} />
      ) : (
        <div className="card p-12 text-center">
          <Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {!selectedIdeaId 
              ? "Select a content idea to get started." 
              : "No script generated for this idea yet."}
          </p>
          {selectedIdeaId && (
            <p className="text-sm text-gray-500">
              Configure options and click Generate to create a complete video script.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
