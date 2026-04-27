'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Layers, Info, Loader2, AlertCircle } from 'lucide-react';
import { StudioViewport } from '@/components/studio/StudioViewport';
import { LockedOverlay } from '@/components/studio/LockedOverlay';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function StudioPage() {
  const searchParams = useSearchParams();
  const ideaIdParam = searchParams.get('idea');
  
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(ideaIdParam || '');
  const [mode, setMode] = useState<'realistic' | 'architectural'>('realistic');
  const [budget, setBudget] = useState<'budget' | 'mid' | 'premium'>('mid');

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

  // Fetch setups for selected idea
  const { data: existingSetups, refetch: refetchSetups, isLoading: isLoadingSetups } = useQuery({
    queryKey: ['setups', selectedIdeaId],
    enabled: !!selectedIdeaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_setups')
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
          action: 'generate-setup',
          ideaId: selectedIdeaId,
          preferences: { mode, budget }
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate setup');
      }
      return res.json();
    },
    onSuccess: () => {
      refetchSetups();
    }
  });

  const currentSetup = existingSetups && existingSetups.length > 0 
    ? existingSetups.find((s: any) => s.mode === mode) || existingSetups[0] 
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Studio Setup</h1>
        <p className="text-gray-400">Plan your production environment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div 
          onClick={() => setMode('realistic')}
          className={`card cursor-pointer transition-all ${mode === 'realistic' ? 'border-brand-500 bg-brand-500/5' : 'hover:border-brand-500/30'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Realistic Mode</h3>
              <p className="text-sm text-gray-400">Physical equipment setups</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Get recommendations for real-world cameras, lighting rigs, microphones, 
            and acoustic treatment.
          </p>
        </div>

        <LockedOverlay isLocked={false} title="Architectural Mode">
          <div 
            onClick={() => setMode('architectural')}
            className={`card cursor-pointer transition-all h-full ${mode === 'architectural' ? 'border-brand-500 bg-brand-500/5' : 'hover:border-brand-500/30'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Architectural Mode</h3>
                <p className="text-sm text-gray-400">Virtual studio design</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Unreal Engine-style virtual studio with cinematic layouts, 
              camera paths, and lighting grid overlays.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-brand-400" />
              <span className="text-brand-400">Premium only (Mocked unlocked)</span>
            </div>
          </div>
        </LockedOverlay>
      </div>

      <div className="card p-6 bg-dark-800 border-dark-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
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
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Budget Level
            </label>
            <select 
              className="input py-2 text-sm w-full"
              value={budget}
              onChange={(e) => setBudget(e.target.value as any)}
            >
              <option value="budget">Budget / Beginner</option>
              <option value="mid">Mid-Range / Enthusiast</option>
              <option value="premium">Premium / Pro</option>
            </select>
          </div>

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedIdeaId}
            className="btn-primary w-full md:w-auto whitespace-nowrap py-2"
          >
            {generateMutation.isPending ? (
              <span className="flex justify-center items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</span>
            ) : (
              `Generate ${mode === 'realistic' ? 'Physical' : 'Virtual'} Setup (10 tokens)`
            )}
          </button>
        </div>
        
        {generateMutation.isError && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">
              {generateMutation.error instanceof Error ? generateMutation.error.message : 'Generation failed'}
            </p>
          </div>
        )}
      </div>

      {isLoadingSetups ? (
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading production setup...</p>
        </div>
      ) : currentSetup ? (
        <StudioViewport setup={currentSetup.setup_details} />
      ) : (
        <div className="card p-12 text-center">
          <Layers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">
            Select a content idea to generate a production setup (10 tokens).
          </p>
        </div>
      )}
    </div>
  );
}
