import { useState } from 'react';
import { Sparkles, Plus, Loader2, CheckCircle2 } from 'lucide-react';

const PREDEFINED_IDEAS = [
  {
    title: "The 'I Tried X for 30 Days' Challenge",
    hook: "I did X every single day for a month, and the results completely shocked me.",
    description: "A documented journey of trying a new habit, software, or strategy for 30 days.",
    format: "Challenge / Vlog",
    target_audience: "General / Self-Improvement",
    tags: ["challenge", "30days", "lifestyle", "productivity"],
    estimated_engagement: "high"
  },
  {
    title: "How to Achieve [Goal] in 2024 (Step-by-Step)",
    hook: "If you want to achieve X this year, this is the exact roadmap you need to follow.",
    description: "A comprehensive, value-packed guide teaching the viewer a specific skill.",
    format: "Educational / Tutorial",
    target_audience: "Beginners",
    tags: ["guide", "tutorial", "howto", "2024"],
    estimated_engagement: "medium"
  },
  {
    title: "Why Everyone is Wrong About [Trending Topic]",
    hook: "Everyone is talking about X right now, but they're all missing the most important detail.",
    description: "A contrarian take on a popular trend or tool in your niche.",
    format: "Commentary / Analysis",
    target_audience: "Intermediate / Advanced",
    tags: ["analysis", "opinion", "trend", "truth"],
    estimated_engagement: "high"
  }
];

export function PredefinedIdeas({ onSave }: { onSave: (idea: any) => Promise<void> }) {
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savedIdxs, setSavedIdxs] = useState<number[]>([]);

  const handleSave = async (idea: any, idx: number) => {
    setSavingIdx(idx);
    try {
      await onSave(idea);
      setSavedIdxs(prev => [...prev, idx]);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingIdx(null);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-400" />
        <h2 className="text-xl font-bold text-white">Predefined Templates</h2>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Don't know where to start? Browse these proven video frameworks and save them to your account.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {PREDEFINED_IDEAS.map((idea, idx) => (
          <div key={idx} className="card p-5 bg-dark-800 border-dark-700 hover:border-brand-500/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded-full bg-brand-500/10 text-brand-400 font-medium">
                  {idea.format}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 font-medium border border-green-500/20">
                  High Engagement
                </span>
              </div>
              <h3 className="font-bold text-white mb-2">{idea.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-3 mb-4">{idea.description}</p>
            </div>
            
            <button
              onClick={() => handleSave(idea, idx)}
              disabled={savingIdx === idx || savedIdxs.includes(idx)}
              className={\`btn-\${savedIdxs.includes(idx) ? 'secondary' : 'primary'} w-full flex items-center justify-center gap-2 py-2 text-sm\`}
            >
              {savingIdx === idx ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : savedIdxs.includes(idx) ? (
                <><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved</>
              ) : (
                <><Plus className="w-4 h-4" /> Save Template</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
